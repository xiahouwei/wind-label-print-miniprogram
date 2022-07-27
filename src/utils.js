const labelPrintReg = /(^printer)|(^gp)/
let debugFlag = true
const successToast = function (title) {
	wx.showToast({
		title,
		icon: 'success',
		duration: 2000
	})
}
const errorToast = function (title) {
	wx.showToast({
		title,
		icon: 'error',
		duration: 2000
	})
}

const ab2Ascii = function (buffer) {
	const hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function (bit) {
			return String.fromCharCode(bit)
		}
	)
	return hexArr.join('')
}

const str2buffer = function (str) {
	const buffer = new ArrayBuffer(str.length)
	const dataView = new DataView(buffer)
	const strs = [...str]
	strs.forEach((item, index) => {
		dataView.setUint8(index, item)
	})
	return buffer
}

const debug = function () {
	if (debugFlag) {
		console.log(...arguments)
	}
}

const setDebugFlag = function (flag) {
	debugFlag = flag
}

const setDeviceCache = function (deviceId, deviceName) {
	console.log(deviceId, deviceName)
	wx.setStorageSync('fx-device-label-print', `${deviceId}$$${deviceName}`)
}

const getDeviceCache = function () {
	const device = wx.getStorageSync('fx-device-label-print')
	if (device) {
		const [deviceId, deviceName] = device.split('$$')
		return {
			deviceId,
			deviceName
		}
	} else {
		return {}
	}
}

const noop = () => {}

const isAndroid = function (val) {
	return val === 'android'
}

module.exports = {
	labelPrintReg,
	errorToast,
	successToast,
	ab2Ascii,
	str2buffer,
	debug,
	setDebugFlag,
	setDeviceCache,
	getDeviceCache,
	noop,
	isAndroid
}
