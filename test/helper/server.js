import WebSocket from 'ws'
import hexId from '@tadashi/hex-id'
import toPort from 'hash-to-port'
import app from '../../server/app.js'

const port = toPort(hexId())

export function server(p = port) {
	return new Promise(resolve => {
		// app.listen('::', Number(p), token => {
		app.listen('0.0.0.0', Number(p), token => {
			if (token) {
				resolve({
					token,
					http: `http://0.0.0.0:${p}`,
					ws: `ws://0.0.0.0:${p}`,
				})
			}
		})
	})
}

export function websocket(url, options = {}) {
	return new WebSocket(url, options)
}
