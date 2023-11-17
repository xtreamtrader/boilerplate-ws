import uWS from 'uWebSockets.js'
import upgrade from './middleware/upgrade.js'
import open from './middleware/open.js'
import message from './middleware/message.js'
import close from './middleware/close.js'
// import * as debug from '@tadashi/debug'

// Server
const app = uWS.App()
app.ws('/*', {
	compression: uWS.SHARED_COMPRESSOR,
	maxPayloadLength: 16 * 1024 * 1024,
	idleTimeout: 300,
	upgrade,
	open,
	message,
	close,
	// drain(ws) {
	// 	debug.info('ws | drain', ws?._data?.name, ws.getBufferedAmount())
	// },
}).any('/*', res => {
	res.end('Nothing to see here!')
})

export default app
