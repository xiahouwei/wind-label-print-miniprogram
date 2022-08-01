const eventBus = require('wind-eventbus-miniprogram')
const tsc = require('./tsc.js')
const {
	labelPrintReg,
	successToast,
	errorToast,
	str2buffer,
	debug,
	setDebugFlag,
	setDeviceCache,
	getDeviceCache,
	noop,
	isAndroid
} = require('./utils')

const $fxLabelPrintEventBus = eventBus.$fxCreateEventBus()

const PRINT_DEFAULT_CONFIG = {
	pageWidght: 60,
	pageHeight: 40,
	gap: 1,
	textFont: 'TSS24.BF2',
	barcodeType: '128',
	barcodeReadable: 1,
	barcodeNarrow: 3,
	barcodeWide: 3
}

class LablePrint {
	constructor () {
		const sysInfo = wx.getSystemInfoSync()
		this.isAndroid = isAndroid(sysInfo.platform)
		this.ready = null
		this.scanDeviceState = false
		this.devicesList = []
		this.deviceName = ''
		this.deviceId = ''
		this.serviceId = ''
		this.writeCharacteristicId = ''
		this.notifyCharacteristicId = ''
		this.onBluetoothDeviceFoundCallBack = noop
		this.isLabelSend = false
		this.oneTimeData = 20
		this.printNum = 1
		this.currentPrint = 1
	}

	// 开启蓝牙模块
	init () {
		return new Promise(resolve => {
			debug('开启蓝牙模块')
			if (this.ready) {
				resolve(this.ready)
			} else {
				wx.openBluetoothAdapter({
					success: (res) => {
						debug('开启蓝牙模块-成功', res)
						this.ready = res
						resolve(res)
					},
					fail (error) {
						console.log(error)
						errorToast('蓝牙未开启!')
					}
				})
			}
		})
	}

	// 静默连接
	silentConnect = () => {
		return new Promise(resolve => {
			const { deviceId, deviceName } = getDeviceCache()
			if (deviceId) {
				this.connectionLabelPrint(deviceId, deviceName, true).then(() => {
					resolve({ deviceId, deviceName })
				})
			}
		})
	}

	// 获取上次连接的设备信息
	getDefaultDevice = () => {
		const { deviceId, deviceName } = getDeviceCache()
		if (deviceId) {
			return this.createDeviceObj(deviceName, deviceId)
		}
	}

	// 扫描打印机
	scanLabelPrint () {
		return new Promise(resolve => {
			console.log('scan-start')
			this.getBluetoothAdapterState().then(this.getBluetoothDevices).then(res => {
				resolve(res)
			})
		})
	}

	// 获取当前设备蓝牙状态
	getBluetoothAdapterState = () => {
		return new Promise(resolve => {
			console.log('getBluetoothAdapterState-start')
			wx.getBluetoothAdapterState({
				success: (res) => {
					console.log('openBluetoothAdapter success', res)
					if (res.available) {
						if (res.discovering) {
							wx.stopBluetoothDevicesDiscovery({
								success: function (res) {
									debug('关闭蓝牙搜索-成功', res)
								}
							})
						} else {
							resolve()
						}
					} else {
						errorToast('蓝牙不可用!')
					}
				}
			})
		})
	}

	// 获取蓝牙设备信息
	getBluetoothDevices = () => {
		return new Promise(resolve => {
			this.getBluetoothAdapterState().then(() => {
				console.log('start search')
				wx.showLoading({
					title: '正在搜索...',
					icon: 'loading'
				})
				wx.startBluetoothDevicesDiscovery({
					success: (res) => {
						console.log(res)
						setTimeout(() => {
							wx.getBluetoothDevices({
								success: (res) => {
									console.log(res.devices.filter)
									const devices = this.filterDevices(res.devices)
									wx.hideLoading()
									wx.stopPullDownRefresh()
									wx.stopBluetoothDevicesDiscovery({
										success: function (res) {
											console.log('停止搜索蓝牙')
										}
									})
									resolve(devices)
								}
							})
						}, 5000)
					},
					fail: () => {
						wx.hideLoading()
						errorToast('搜索失败!')
					}
				})
			})
		})
	}

	// 过滤设备
	filterDevices (devices) {
		return devices.filter(item => item.name && labelPrintReg.test(item.name.toLowerCase()))
	}

	// 停止扫描设备
	stopScan () {
		return new Promise(resolve => {
			if (!this.scanDeviceState) {
				resolve()
			} else {
				wx.stopBluetoothDevicesDiscovery({
					success: (res) => {
						debug('停止搜索蓝牙设备')
						this.scanDeviceState = false
						resolve()
					}
				})
			}
		})
	}

	// 连接标签打印机
	connectionLabelPrint (deviceId, deviceName, silent = false) {
		return this.connectionLabelPrintHandler(silent)(deviceId, deviceName)
			.then(this.createLabelPrintService(silent))
			.then(this.getLabelPrintCharacteristics(silent))
	}

	connectionLabelPrintHandler = (silent) => {
		return (deviceId, deviceName) => {
			return new Promise((resolve, reject) => {
				debug('标签打印机建立连接', deviceId)
				wx.createBLEConnection({
					deviceId,
					success: (res) => {
						debug('标签打印机建立连接-成功', res)
						this.deviceId = deviceId
						this.deviceName = deviceName
						setDeviceCache(deviceId, deviceName)
						resolve()
					},
					fail (error) {
						if (!silent) {
							errorToast('无法连接!')
						}
						reject(error)
					}
				})
			})
		}
	}

	// 标签打印机建立服务
	createLabelPrintService = (silent) => {
		return () => {
			return new Promise((resolve, reject) => {
				debug('标签打印机建立服务连接', this.deviceId)
				wx.getBLEDeviceServices({
					deviceId: this.deviceId,
					success: (res) => {
						debug('标签打印机建立服务连接-成功')
						debug('device services:', res.services)
						const serviceId = res.services[0].uuid
						this.serviceId = serviceId
						resolve(serviceId)
					},
					fail (error) {
						if (!silent) {
							errorToast('无法建立服务!')
						}
						reject(error)
					}
				})
			})
		}
	}

	// 获取标签打印机服务描述
	getLabelPrintCharacteristics = (silent) => {
		return () => {
			return new Promise((resolve, reject) => {
				debug('获取标签打印机服务描述')
				wx.getBLEDeviceCharacteristics({
					deviceId: this.deviceId,
					serviceId: this.serviceId,
					success: (res) => {
						debug('获取标签打印机服务描述-成功')
						debug('device getBLEDeviceCharacteristics:', res.characteristics)
						const notifyCharacteristic = res.characteristics.find(item => !!item.properties.notify)
						const writeCharacteristic = res.characteristics.find(item => !!item.properties.write)
						if (!notifyCharacteristic || !writeCharacteristic) {
							errorToast('无法连接服务!')
						} else {
							this.notifyCharacteristicId = notifyCharacteristic.uuid
							this.writeCharacteristicId = writeCharacteristic.uuid
							resolve()
						}
					},
					fail (error) {
						if (!silent) {
							errorToast('无法连接服务!')
						}
						reject(error)
					}
				})
			})
		}
	}

	// 获取标签打印机扫描状态
	getScanState () {
		return this.scanDeviceState
	}

	// 获取已经扫描过的设备列表
	getDevicesList () {
		return this.devicesList
	}

	// 获取标签打印机连接状态
	getDeviceConnect () {
		return {
			deviceName: this.deviceName,
			deviceId: this.deviceId
		}
	}

	// 监听标签打印机连接状态
	doBLEConnectionStateChange = (res) => {
		if (res.deviceId === this.deviceId && !res.connected) {
			this.deviceName = ''
			this.deviceId = ''
			$fxLabelPrintEventBus.emit('lablePrintConnect', {
				connected: false
			})
		}
	}

	// 断开标签打印机的连接
	closeLabelPrint = (deviceId = this.deviceId) => {
		return new Promise(resolve => {
			wx.closeBLEConnection({
				deviceId,
				success (res) {
					resolve(res)
				}
			})
		})
	}

	// 打印标签
	print (data, template) {
		this.isLabelSend = true
		this.sendPrintCommand(data, template).then(() => {
			this.isLabelSend = false
			successToast('打印成功!')
		})
	}

	sendPrintCommand (data, template) {
		const command = tsc.jpPrinter.createNew()
		const size = template.size || {}
		const content = template.content
		command.setCls()
		command.setSize(size.pageWidght || PRINT_DEFAULT_CONFIG.pageWidght, size.pageHeight || PRINT_DEFAULT_CONFIG.pageHeight)
		command.setGap(template.gap || PRINT_DEFAULT_CONFIG.gap)
		command.setCls()
		content.forEach(item => {
			this.printTypeHandle(command, item.type)(item, item.handle(data))
		})
		command.setPrint(1)
		if (this.isAndroid) {
			return this.prepareSend(command.getData())
		} else {
			return this.send(command.getData())
		}
	}

	printTypeHandle (command, type) {
		if (type === 'text') {
			return this.textPrintHandle(command)
		} else if (type === 'barcode') {
			return this.barcodePrintHandle(command)
		}
	}

	textPrintHandle (command) {
		return (template, str) => {
			command.setText(template.x, template.y, PRINT_DEFAULT_CONFIG.textFont, 0, 1, 1, str)
		}
	}

	barcodePrintHandle (command) {
		return (template, str) => {
			command.setBarCode(template.x, template.y, PRINT_DEFAULT_CONFIG.barcodeType, template.height, PRINT_DEFAULT_CONFIG.barcodeReadable, 0, template.narrow || PRINT_DEFAULT_CONFIG.barcodeNarrow, template.wide || PRINT_DEFAULT_CONFIG.barcodeWide, str)
		}
	}


	printMulity (dataList, template) {
		console.log('printMulity')
		this.isLabelSend = true
		const sendPrintResult = dataList.reduce((printPromise, next) => {
			return printPromise.then(() => {
				return this.sendPrintCommand(next, template)
			})
		}, Promise.resolve())
		sendPrintResult.then(() => {
			this.isLabelSend = false
			successToast('打印成功!')
		})
	}

	send (data) {
		wx.showLoading({
			title: '正在打印',
			icon: 'loading'
		})
		return new Promise(resolve => {
			wx.writeBLECharacteristicValue({
				deviceId: this.deviceId,
				serviceId: this.serviceId,
				characteristicId: this.writeCharacteristicId,
				value: str2buffer(data),
				success: (res) => {
					debug('打印成功', res)
					wx.hideLoading()
					resolve()
				},
				fail (error) {
					console.log(error)
					wx.hideLoading()
					errorToast('打印失败!')
				}
			})
		})
	}

	prepareSend (buff) {
		return new Promise(resolve => {
			this.looptime = parseInt(buff.length / this.oneTimeData) + 1
			this.lastData = parseInt(buff.length % this.oneTimeData)
			this.currentTime = 1
			wx.showLoading({
				title: '正在打印',
				icon: 'loading'
			})
			this.subSend(buff, resolve)
		})
	}

	subSend (buff, resolve) {
		let currentTime = this.currentTime
		const loopTime = this.looptime
		const lastData = this.lastData
		const onTimeData = this.oneTimeData
		const printNum = this.printNum
		let currentPrint = this.currentPrint
		let buf
		let dataView
		if (currentTime < loopTime) {
			buf = new ArrayBuffer(onTimeData)
			dataView = new DataView(buf)
			for (let i = 0; i < onTimeData; ++i) {
				dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
			}
		} else {
			buf = new ArrayBuffer(lastData)
			dataView = new DataView(buf)
			for (let i = 0; i < lastData; ++i) {
				dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i])
			}
		}
		wx.writeBLECharacteristicValue({
			deviceId: this.deviceId,
			serviceId: this.serviceId,
			characteristicId: this.writeCharacteristicId,
			value: buf,
			success: (res) => {
				// if (currentPrint == printNum) {
				// 	wx.showToast({
				// 		title: '成功打印' + currentPrint,
				// 	})
				// }
			},
			fail: (e) => {
				wx.hideLoading()
				wx.showToast({
					title: '打印失败',
					icon: 'none'
				})
			},
			complete: () => {
				currentTime++
				if (currentTime <= loopTime) {
					this.currentTime = currentTime
					this.subSend(buff, resolve)
				} else {
					if (currentPrint === printNum) {
						this.looptime = 0
						this.lastData = 0
						this.currentTime = 1
						this.isLabelSend = false
						this.currentPrint = 1
						wx.hideLoading()
						resolve()
					} else {
						currentPrint++
						this.currentPrint = currentPrint
						this.currentTime = 1
						this.subSend(buff, resolve)
					}
				}
			}
		})
	}

	// 判断是标签打印机
	isLabelPrint (name) {
		return name && labelPrintReg.test(name.toLowerCase())
	}

	// 订阅蓝牙打印机连接状态变更信息
	onLabelPrintConnectChange = (context, fn) => {
		$fxLabelPrintEventBus.on('lablePrintConnect', context, fn)
	}

	offLabelPrintConnectChange = (context) => {
		$fxLabelPrintEventBus.remove('lablePrintConnect', context)
	}

	// 创建蓝牙打印机对象
	createDeviceObj (name, deviceId) {
		return {
			name,
			deviceId
		}
	}

	// 开启调试
	openDebug () {
		setDebugFlag(true)
	}
}
module.exports = {
	$fxLabelPrint: new LablePrint()
}
