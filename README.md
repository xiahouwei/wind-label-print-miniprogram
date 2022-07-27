# wind-label-print-miniprogram

一个用于微信小程序的蓝牙打印机核心包

#### 0.支持的蓝牙标签打印机

##### 0.1 Gprinter佳博 热敏条码打印机 型号 GP-3120TU

#### 1.安装
```
// 1. 在小程序开发工具

npm install wind-label-print-miniprogram --save

// 2. 小程序开发工具选择 [工具] -> [构建npm]

```

不错的教程👇🏻👇🏻👇🏻

[微信小程序如何引入npm包？](https://developers.weixin.qq.com/community/develop/article/doc/0008aecec4c9601e750be048d51c13)


#### 2.使用

```javascript
// $fxWeight为蓝牙电子秤实例
import { $fxLabelPrint } from 'wind-label-print-miniprogram'
```

#### 2.1 蓝牙电子秤初始化 --- init

```javascript
// 失败会自动提示蓝牙未开启
$fxLabelPrint.init().then(res => {
    // 蓝牙开启成功
})

```

#### 2.2 扫描蓝牙打印机 --- scanLabelPrint

```javascript
// 扫描蓝牙打印机
$fxLabelPrint.scanLabelPrint().then(res => {
	if (res.length === 0) {
		wx.showToast({
			title: '未扫描到可使用的打印机',
			icon: 'error',
			duration: 2000
		})
	}
	this.setData({
		deviceList: res,
		connectDeviceId: ''
	})
})

```

#### 2.3 停止扫描蓝牙打印机 --- stopScan

```javascript
$fxLabelPrint.stopScan().then(() => {
    this.setData({
        searchState: false
    })
})

```

#### 2.4 连接蓝牙打印机 --- connectionLabelPrint

```javascript
$fxLabelPrint.connectionLabelPrint(deviceId, name).then(() => {
	this.setDeviceConnect(deviceId, name)
}).catch(() => {
	this.setData({
		connectDeviceId: ''
	})
})

```


#### 2.5 断开蓝牙打印机 --- closeLabelPrint

```javascript
$fxLabelPrint.closeLabelPrint(deviceId).then(() => {
    wx.showToast({
		title: '已断开标签打印机连接',
		icon: 'success',
		duration: 2000
	})
})

```

#### 2.6 获取蓝牙打印机连接状态 --- getDeviceConnect

```javascript
$fxLabelPrint.getDeviceConnect()

```

#### 2.7 获取已经扫描过的设备列表

```javascript
$fxLabelPrint.getDevicesList()

```

#### 2.8 获取电子秤扫描状态

```javascript
$fxLabelPrint.getScanState()

```


#### 2.9 监听标签打印机连接状态, 如果断开, 则进行断开逻辑

```javascript
wx.onBLEConnectionStateChange((res) => {
	$fxLabelPrint.doBLEConnectionStateChange(res)
})

```

#### 2.10 打印单张标签
```javascript
$fxLabelPrint.print(printData, labelTemplate)
```

#### 2.11 打印多张标签

```javascript
$fxLabelPrint.printMulity(printDataList, labelTemplate)
```

#### 2.12 标签模板/数据

```javascript
const ITEM_LABEL_TEMPLATE = {
	size: {
		// 标签宽度
		pageWidght: 60,
		// 标签高度
		pageHeight: 40
	},
	content: [
		{
			// 字段id
			id: 'date',
			// 字段类型, 支持 text(文本), barcode(条码)
			type: 'text',
			// x坐标
			x: 280,
			// y坐标
			y: 5,
			// 内容, 接收回调, 传参为printData
			handle (data) {
				return data.date
			}
		}, {
			id: 'name',
			type: 'text',
			x: 30,
			y: 5,
			handle (data) {
				return data.name
			}
		},{
			id: 'barcode',
			type: 'barcode',
			x: 50,
			y: 205,
			height: 60,
			handle (data) {
				return data.barcode || ''
			}
		}
	]
}
const printData = {
	date: '2022/07/01',
	name: '要打印的文本',
	barcode: '0123456789'
}
const printDataList = [{
	date: '2022/07/01',
	name: '要打印的文本',
	barcode: '0123456789'
}, {
	date: '2022/07/01',
	name: '要打印的文本',
	barcode: '0123456789'
}, {
	date: '2022/07/01',
	name: '要打印的文本',
	barcode: '0123456789'
}]

module.exports = {
	itemLabelTemplate: ITEM_LABEL_TEMPLATE
}
```

#### 2.12 开启调试

```javascript
$fxLabelPrint.openDebug()

```