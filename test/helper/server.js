import WebSocket from 'ws'
import hexId from '@tadashi/hex-id'
import toPort from 'hash-to-port'
import app from '../../server/app.js'

const hostname = '127.0.0.1'
const port = toPort(hexId())

export function run(p = port) {
	return new Promise(resolve => {
		// app.listen('::', Number(p), token => {
		app.listen(hostname, Number(p), token => {
			if (token) {
				resolve({
					token,
					http: `http://${hostname}:${p}`,
					ws: `ws://${hostname}:${p}`,
				})
			}
		})
	})
}

export function websocket(url, options = {}) {
	return new WebSocket(url, options)
}
