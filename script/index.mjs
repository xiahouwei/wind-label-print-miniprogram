import { execa } from 'execa'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const resolve =  dir => {
	return path.join(__dirname, dir)
}
const createCommitMsg = () => {
	return `task:同步更新 ${new Date().toDateString()}`
}
const filterFunc = src => {
	return !/node_modules$|.git$|package-lock.json$|.DS_Store$/.test(src)
}
const targeCwd = '/Users/shanghuawei/01_work/02_工作项目/00_风行核心依赖/02_wind-label-print-miniprogram'
const args = ['install', '--loglevel', 'error']

try {
	fs.copySync(resolve('../'), targeCwd, { filter: filterFunc })
	await execa('npm', args, {
		cwd: targeCwd,
		stdio: ['inherit', 'inherit', 'inherit']
	})
	await execa('git', ['add', '.'], {
		cwd: targeCwd,
		stdio: ['inherit', 'inherit', 'inherit']
	})
	await execa('git', ['commit', '-m', createCommitMsg()], {
		cwd: targeCwd,
		stdio: ['inherit', 'inherit', 'inherit']
	})
	await execa('git', ['push'], {
		cwd: targeCwd,
		stdio: ['inherit', 'inherit', 'inherit']
	})
	console.log('upload2git success!')
} catch (err) {
	console.error(err)
}

