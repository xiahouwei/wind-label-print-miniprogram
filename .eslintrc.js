module.exports = {
	extends: [
        'standard'
    ],
	env: {
		browser: true,
		es6: true
	},
	parser: '@babel/eslint-parser',
	parserOptions: {
		ecmaVersion: 2017
	},
	globals: {
		window: true,
		wx: true
	},
	rules: {
		// 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		// 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		// allow paren-less arrow functions
		'arrow-parens': 0,
		// allow async-await
		'generator-star-spacing': 0,
		// allow debugger during development
		'no-debugger': 0,
		// 关闭禁止混用tab和空格
		'no-mixed-spaces-and-tabs': 2,
		'no-extra-semi': 2,
		// 1 tab
		indent: ['warn', 'tab'],
		'no-tabs': 'off',
		// 禁止结尾没有分号
		semi: ['error', 'never'],
		// 禁止出现多行空行
		'no-multiple-empty-lines': 0,
		// 禁止重复引用
		'no-duplicate-imports': 'off',
		// 禁止在 import 和 export 和解构赋值时将引用重命名为相同的名字
		'no-useless-rename': 0,
		'no-return-await': 0,
		// 转义符
		'no-useless-escape': 0,
		// 不允许扩展原生对象
		// "no-extend-native" : 0,
		// 不允许对null用==或者!=
		'no-eq-null': 2,
		'accessor-pairs': ["error", {}]
	}
}
