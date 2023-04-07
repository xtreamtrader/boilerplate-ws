import process from 'node:process'
import querystring from 'node:querystring'
import {verify} from '@tadashi/jwt'
import cookie from 'cookie'
// import * as debug from './debug.js'

const {
	AUTH_COOKIE_KEY = 'jwt',
	AUTH_QS_KEY = 'jwt',
	AUTH_HEADER_KEY = 'Bearer',
	AUTH_SECRET = 'exemplo',
} = process.env

function _authorization(authorization) {
	const [type, token] = String(authorization).split(' ')
	if (type === AUTH_HEADER_KEY && token) {
		return token
	}
}

function _jwt(req) {
	const _cookie = cookie.parse(req.getHeader('cookie'))
	const _token = _authorization(req.getHeader('authorization'))
	const _qs = querystring.parse(req.getQuery())
	return _cookie?.[AUTH_COOKIE_KEY] ?? _token ?? _qs?.[AUTH_QS_KEY] ?? false
}

async function auth(req) {
	const token = _jwt(req)
	const result = await verify(token, {}, AUTH_SECRET)
	if (result) {
		const {payload} = result
		const data = {
			payload,
		}
		return data
	}
	throw new Error('401 Unauthorized')
}

export default auth
