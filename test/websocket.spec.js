import {setTimeout} from 'node:timers/promises'
import {test} from 'node:test'
import assert from 'node:assert/strict'
import uWS from 'uWebSockets.js'
import got from 'got'
import {pEvent, pEventMultiple} from 'p-event'
import {run, websocket} from './helper/server.js'

const AUTH_KEY = 'Bearer'
const QS_KEY = 'token'
const token_user_a = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiaWQiOiI2MjcxYmFiNWY2N2U5Y2NkNDkwMzNhYmIifQ.hmoUE_vayFKMKGz0v9iPLfIuneklDkL_qnD2n5QVKrYXmUwUqoJlSKGgafXIQGlyFxNZTucE8z8qdSRHZ-IXRQ'
const token_user_b = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsYmVydG8gUm9iZXJ0byIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImlkIjoiNjI3MWJhYjVmNjdlOWNjZDQ5MDMzYWJjIn0.CEoDPZn3IRrP4Cob6V_C41FxiqZoNkI6maN6c9tvfMrzw8gB5WWxBSiGdUWJ9HF4drPJANgEvfHKL8C0gNeuxA'

test('app', async t => {
	const {token, http, ws} = await run()

	t.after(() => {
		uWS.us_listen_socket_close(token)
	})

	await t.test('nothing', async () => {
		const r = await got.get(http, {
			throwHttpErrors: false,
		})

		assert.equal(r.statusCode, 200)
		assert.equal(r.body, 'Nothing to see here!')
	})

	await t.test('message', async () => {
		const url_a = `${ws}/?${QS_KEY}=${token_user_a}`
		const ws_a = websocket(url_a)

		const url_b = `${ws}/?${QS_KEY}=${token_user_b}`
		const ws_b = websocket(url_b)

		// prettier-ignore
		await Promise.all([
			pEvent(ws_a, 'open'),
			pEvent(ws_b, 'open'),
		])

		const promise_a = pEventMultiple(ws_a, ['message', 'close'], {
			resolveImmediately: true,
			count: Number.POSITIVE_INFINITY,
		})

		const promise_b = pEventMultiple(ws_b, ['message', 'close'], {
			resolveImmediately: true,
			count: Number.POSITIVE_INFINITY,
		})

		const result_a = await promise_a
		const result_b = await promise_b

		await setTimeout(1000)

		ws_a.send(
			JSON.stringify({
				action: 'direct',
				message: 'Olá',
				to: '6271bab5f67e9ccd49033abc',
			}),
		)

		ws_a.send(
			JSON.stringify({
				action: 'me',
				message: 'Espelho, espelho meu!!',
			}),
		)

		ws_a.send(
			JSON.stringify({
				action: 'broadcast',
				message: 'Olá pessoal!',
			}),
		)

		ws_a.send(
			JSON.stringify({
				action: 'xxx',
			}),
		)

		ws_a.send(
			JSON.stringify({
				xxx: 'xxx',
			}),
		)

		ws_a.send('{action: json_invalid}')

		ws_a.close(1000)
		ws_b.close(1000)

		await setTimeout(1000)

		for (const [k, data] of result_a.entries()) {
			const _data = JSON.parse(data)
			if (k === 0) assert.equal(_data.message, 'Espelho, espelho meu!!')
			if (k === 1) assert.equal(_data.message, 'ws | message | The action "xxx" not allowed')
			if (k === 2) assert.equal(_data.message, 'ws | message | The action "unknown" not allowed')
			// prettier-ignore
			if (k === 3) assert.equal(_data.message, 'ws | message | Expected property name or \'}\' in JSON at position 1')
			if (k === 4) assert.equal(_data, 1000)
		}

		for (const [k, data] of result_b.entries()) {
			const _data = JSON.parse(data)
			if (k === 0) assert.equal(_data.message, 'Olá')
			if (k === 1) assert.equal(_data.message, 'Olá pessoal!')
			if (k === 2) assert.equal(_data, 1000)
		}
	})

	await t.test('cookie', async () => {
		const ws_a = websocket(ws, {
			headers: {
				Cookie: `${QS_KEY}=${token_user_a}`,
				Host: '127.0.0.1',
			},
		})

		await pEvent(ws_a, 'open')

		ws_a.close(1000)
		const r = await pEvent(ws_a, 'close')

		assert.equal(r, 1000)
	})

	await t.test('authorization', async () => {
		const ws_a = websocket(ws, {
			headers: {
				Authorization: `${AUTH_KEY} ${token_user_a}`,
				Host: '127.0.0.1',
			},
		})

		await pEvent(ws_a, 'open')

		ws_a.close(1000)
		const r = await pEvent(ws_a, 'close')

		assert.equal(r, 1000)
	})

	await t.test('401', (_, done) => {
		const ws_a = websocket(ws)
		ws_a.on('unexpected-response', (req, res) => {
			assert.equal(res.statusCode, 401)
			res.on('end', done)
			req.destroy()
		})
	})

	await t.test('abort', async () => {
		const ws_a = websocket(ws, {
			headers: {
				Authorization: `${AUTH_KEY} ${token_user_a}`,
				Host: '127.0.0.1',
				'x-slow': 'true',
			},
		})

		await setTimeout(100)
		ws_a.close()

		const error = await pEvent(ws_a, 'error')
		assert.equal(error.message, 'WebSocket was closed before the connection was established')
	})
})
