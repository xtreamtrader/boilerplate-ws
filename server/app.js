/*eslint new-cap: 0*/

import uWS from 'uWebSockets.js'
import auth from './lib/auth.js'
import * as debug from './lib/debug.js'

// Store Websocket
const wsSet = new Set()

// Server
const app = uWS.App()
app
	.ws('/*', {
		compression: uWS.SHARED_COMPRESSOR,
		maxPayloadLength: 16 * 1024 * 1024,
		idleTimeout: 300,
		upgrade(res, req, context) {
			const upgradeAborted = {
				aborted: false,
			}

			res.onAborted(() => {
				upgradeAborted.aborted = true
			})

			auth(req).then(data => {
				if (upgradeAborted.aborted) {
					debug.error('Ouch! Client disconnected before we could upgrade it!')
					throw new Error('426 Upgrade Required')
				}

				res.upgrade(
					{
						_data: data?.payload ?? data,
						_url: req.getUrl(),
						_query: req.getQuery(),
					},
					req.getHeader('sec-websocket-key'),
					req.getHeader('sec-websocket-protocol'),
					req.getHeader('sec-websocket-extensions'),
					context,
				)
			}).catch(error => {
				debug.error(error.message)
				res.cork(() => {
					res
						.writeStatus(error.message)
						.end()
				})
			})
		},
		open(ws) {
			// Armazena o Websocket na store
			wsSet.add(ws)
			debug.info('open ws', ws)
		},
		message(ws, message, isBinary) {
			try {
				// Envia mensagem para os outros
				const _message = JSON.parse(Buffer.from(message).toString('utf8'))
				for (const _ws of wsSet) {
					if (_ws !== ws) {
						_ws.send(Buffer.from(JSON.stringify({
							action: 'message',
							message: _message?.message,
						}), 'utf8'), isBinary)
					}
				}
			} catch (error) {
				// Envia mensagem de erro
				ws.send(Buffer.from(JSON.stringify({
					action: 'error',
					message: `ws | message | ${error.message}`,
				}), 'utf8'), isBinary)
			}
		},
		drain(ws) {
			debug.info('ws | drain', ws?._data?.name, ws.getBufferedAmount())
		},
		close(ws, code, message) {
			debug.info('ws | close', ws?._data?.name ?? 'Unknow', code, Buffer.from(message).toString('utf8'))
			wsSet.delete(ws)
			ws = undefined
		},
	})
	.any('/*', res => {
		res.end('Nothing to see here!')
	})

export default app
