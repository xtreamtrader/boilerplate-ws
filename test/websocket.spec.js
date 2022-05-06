import uWS from 'uWebSockets.js'
import {pEvent, pEventMultiple} from 'p-event'
import test from 'ava'
import {server, websocket} from './helper/server.js'

const AUTH_QS_KEY = 'jwt'
const token_user_a = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiaWQiOiI2MjcxYmFiNWY2N2U5Y2NkNDkwMzNhYmIifQ.hmoUE_vayFKMKGz0v9iPLfIuneklDkL_qnD2n5QVKrYXmUwUqoJlSKGgafXIQGlyFxNZTucE8z8qdSRHZ-IXRQ'
const token_user_b = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsYmVydG8gUm9iZXJ0byIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImlkIjoiNjI3MWJhYjVmNjdlOWNjZDQ5MDMzYWJjIn0.CEoDPZn3IRrP4Cob6V_C41FxiqZoNkI6maN6c9tvfMrzw8gB5WWxBSiGdUWJ9HF4drPJANgEvfHKL8C0gNeuxA'

let listenSocket

test.before(async t => {
	const {token, http, ws} = await server()
	listenSocket = token
	t.context.urls = {http, ws}
})

test.after(() => {
	if (listenSocket) {
		uWS.us_listen_socket_close(listenSocket)
		listenSocket = undefined
	}
})

test('message', async t => {
	const url_a = `${t.context.urls.ws}/?${AUTH_QS_KEY}=${token_user_a}`
	const ws_a = websocket(url_a)

	const url_b = `${t.context.urls.ws}/?${AUTH_QS_KEY}=${token_user_b}`
	const ws_b = websocket(url_b)

	// ---

	await Promise.all([
		pEvent(ws_a, 'open'),
		pEvent(ws_b, 'open'),
	])

	// ---

	const promise_a = pEventMultiple(ws_a, 'message', {
		count: 1,
	})

	const promise_b = pEventMultiple(ws_b, 'message', {
		count: 1,
	})

	ws_a.send(JSON.stringify({
		action: 'message',
		message: 'Apenas um show',
	}))

	ws_a.send('{action: json_invalid}')

	const result_a = await promise_a
	for (const data of result_a) {
		t.snapshot(JSON.parse(data), 'a')
	}

	const result_b = await promise_b
	for (const data of result_b) {
		t.snapshot(JSON.parse(data), 'b')
	}

	ws_a.close(1000)
	await pEvent(ws_a, 'close')

	ws_b.close(1000)
	await pEvent(ws_b, 'close')
})

test('cookie', async t => {
	const url = t.context.urls.ws
	const ws = websocket(url, {
		headers: {
			Cookie: `${AUTH_QS_KEY}=${token_user_a}`,
			Host: '127.0.0.1',
		},
	})

	await pEvent(ws, 'open')
	t.pass('conectado via cookie')

	ws.close(1000)
	await pEvent(ws, 'close')
})

test('401', async t => {
	const ws = websocket(t.context.urls.ws)

	const error = await pEvent(ws, 'error')
	t.snapshot(error, 'error')
})
