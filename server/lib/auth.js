import {setTimeout} from 'node:timers/promises'
import process from 'node:process'
import querystring from 'node:querystring'
import {verify} from '@tadashi/jwt'
import cookie from 'cookie'

// prettier-ignore
const {
	AUTH_KEY = 'Bearer',
	COOKIE_KEY = 'token',
	QS_KEY = 'token',
	SECRET = 'exemplo',
} = process.env

function getAuth(authorization) {
	const [type, token] = String(authorization).split(' ')
	if (type === AUTH_KEY && token) {
		return token
	}
}

function getTokens(props) {
	const _cookie = cookie.parse(props?.cookie)
	const _auth = getAuth(props?.authorization)
	const _qs = querystring.parse(props?.query)
	return new Set([_cookie?.[COOKIE_KEY], _auth, _qs?.[QS_KEY]])
}

export default async function auth(props) {
	// remove this - only for connection abort simulation on unit test
	if (props.xslow) {
		await setTimeout(2000)
	}

	const tokens = [...getTokens(props)]
	const promises = []
	for (const token of tokens) {
		if (token) {
			promises.push(verify(token, {}, SECRET))
		}
	}

	try {
		const {payload} = await Promise.any(promises)
		if (payload && payload.id) {
			return payload
		}
	} catch {
		throw new Error('401 Unauthorized')
	}
}
