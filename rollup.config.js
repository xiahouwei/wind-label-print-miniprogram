import { terser } from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from "@rollup/plugin-babel"
export default {
	input: 'src/index.js',
	output: [{
		file: './print.min.js',
		format: 'cjs',
		name:'printjs',
		exports: 'auto'
	}],
	plugins: [
		terser(),
		resolve(),
		commonjs(),
		babel({ babelHelpers: 'bundled' })
	],
	external: ['wind-eventbus-miniprogram']
};