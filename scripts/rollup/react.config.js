import { getPackageJSON, resolvePkgPath, getBaseRollupPlugins } from './utils';
import generatePackageJson from 'rollup-plugin-generate-package-json';
const { name, module } = getPackageJSON('react');
const pkgPath = resolvePkgPath(name);
const pkgDistPath = resolvePkgPath(name, true);
export default [
	// react
	{
		input: `${pkgPath}/${module}`,
		output: {
			file: `${pkgDistPath}/index.js`,
			name: 'React',
			format: 'umd' // 兼容commonjs和es-module
		},
		plugins: [
			...getBaseRollupPlugins(),
			// 将react包的package.json的部分字段获取后给到打包后的react包的结果
			generatePackageJson({
				inputFolder: pkgPath,
				outputFolder: pkgDistPath,
				// 配置package.json包的字段
				baseContents: ({ name, description, version }) => ({
					name,
					description,
					version,
					main: 'index.js' // 支持commonjs
				})
			})
		]
	},
	// jsx-[dev?]-runtime
	{
		input: `${pkgPath}/src/jsx.ts`,
		output: [
			{
				// jsx-runtime
				file: `${pkgDistPath}/jsx-runtime.js`,
				name: 'jsx-runtime',
				formate: 'umd'
			},
			{
				// jsx-dev-runtime
				file: `${pkgDistPath}/jsx-dev-runtime.js`,
				name: 'jsx-dev-runtime',
				formate: 'umd'
			}
		],
		plugins: getBaseRollupPlugins()
	}
];
