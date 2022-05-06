import process from 'node:process'
import querystring from 'node:querystring'
import {verify} from '@tadashi/jwt'
import cookie from 'cookie'

const {
	AUTH_COOKIE_KEY = 'jwt',
	AUTH_QS_KEY = 'jwt',
	AUTH_SECRET = 'exemplo',
} = process.env

function _token(req) {
	const _cookie = cookie.parse(req.getHeader('cookie'))
	const _qs = querystring.parse(req.getQuery())
	return _qs?.[AUTH_QS_KEY] ?? _cookie?.[AUTH_COOKIE_KEY] ?? false
}

async function auth(req) {
	const token = _token(req)
	const result = await verify(token, {}, AUTH_SECRET)
	if (token && result) {
		const {payload} = result
		const data = {
			// name: payload?.name ?? 'Unknow',
			id: payload.id,
			auth: true,
		}
		return data
	}
	throw new Error('401 Unauthorized')
}

export default auth
