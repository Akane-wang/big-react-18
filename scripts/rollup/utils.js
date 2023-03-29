import path from 'path';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
const pkgPath = path.resolve(__dirname, '../../packages');
const distPath = path.resolve(__dirname, '../../dist/node_modules');

export function resolvePkgPath(pkgname, isDist = false) {
	if (isDist) {
		// 打包产物下的路径
		return `${distPath}/${pkgname}`;
	}
	return `${pkgPath}/${pkgname}`;
}

export function getPackageJSON(pakName) {
	//... 包路径
	const path = `${resolvePkgPath(pakName)}/package.json`;

	const str = fs.readFileSync(path, {
		encoding: 'utf-8'
	});
	return JSON.parse(str);
}

// 获取所有基础的plugins
export function getBaseRollupPlugins({
	alias = {
		__DEV__: true,
		preventAssignment: true // 下一个版本会默认设置为true
	},
	typescript = {}
} = {}) {
	return [replace(alias), cjs(), ts(typescript)];
}
