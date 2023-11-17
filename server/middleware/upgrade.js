import * as debug from '@tadashi/debug'
import auth from '../lib/auth.js'

export default function upgrade(res, req, context) {
	const upgradeAborted = {
		aborted: false,
	}

	res.onAborted(() => {
		upgradeAborted.aborted = true
	})

	const url = req.getUrl()
	const query = req.getQuery()
	const cookie = req.getHeader('cookie')
	const authorization = req.getHeader('authorization')
	const xslow = req.getHeader('x-slow')
	const secWebSocketKey = req.getHeader('sec-websocket-key')
	const secWebSocketProtocol = req.getHeader('sec-websocket-protocol')
	const secWebSocketExtensions = req.getHeader('sec-websocket-extensions')

	let data
	let success

	// prettier-ignore
	auth({
		authorization,
		cookie,
		query,
		url,
		xslow,
	})
		.then(_data => {
			data = _data
			success = true
		})
		.catch(error => {
			debug.error(`upgrade | error | ${error.message}`)
			data = error
			success = false
		})
		.finally(() => {
			if (upgradeAborted.aborted) {
				debug.error('Client disconnected before we could upgrade it!')
				return
			}

			res.cork(() => {
				if (success) {
					res.upgrade(
						{
							_data: data,
						},
						secWebSocketKey,
						secWebSocketProtocol,
						secWebSocketExtensions,
						context,
					)
				} else {
					res.writeStatus(data.message).end()
				}
			})
		})
}
