// Store Websocket
const KEY = Symbol.for('store.ws')
const singleton = Object.create(null)
singleton[KEY] = new Set()

Object.freeze(singleton)

export default singleton[KEY]
