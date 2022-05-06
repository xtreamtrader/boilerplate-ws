import process from 'node:process'
import la from '@tadashi/local-access'
import app from './app.js'
import * as debug from './lib/debug.js'

const {
	PORT = 5000,
	PORT_PUBLISHED = 5000,
	HOSTNAME = '0.0.0.0',
	VERSION = 'dev',
} = process.env

const HOSTNAME_CUSTOM = process.env?.HOSTNAME_CUSTOM ?? HOSTNAME

const {
	local,
	network,
} = la({port: PORT_PUBLISHED, hostname: HOSTNAME_CUSTOM})

const {
	local: local_ws,
	network: network_ws,
} = la({port: PORT_PUBLISHED, hostname: HOSTNAME_CUSTOM, protocol: 'ws'})

app.listen('::', Number(PORT), token => {
	if (token) {
		debug.info('Server listening')
		debug.info('----------------')
		debug.info(`Local:    ${local}`)
		debug.info(`Network:  ${network}`)
		debug.info('----------------')
		debug.info(`Local:    ${local_ws}`)
		debug.info(`Network:  ${network_ws}`)
		debug.info(`Version:  ${VERSION}`)
		process.stdout.write('\n')
	} else {
		debug.error('Failed to listen to port!')
		debug.error(`Local:    ${PORT}`)
		debug.error(`External: ${PORT_PUBLISHED}`)
		process.stderr.write('\n')
	}
})
