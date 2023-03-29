const { defaults } = require('jest-config');
module.exports = {
	...defaults,
	rootDir: process.cwd(), // 命令执行时的根目录（package执行test时的根目录）
	modulePathIgnorePatterns: ['<rootDir>/.history'],
	// 第三方依赖包
	moduleDirectories: [
		// 对于 React ReactDOM
		'dist/node_modules',
		// 对于第三方依赖
		...defaults.moduleDirectories //其他第三方依赖使用默认配置
	],
	testEnvironment: 'jsdom' // 用到的环境
};
