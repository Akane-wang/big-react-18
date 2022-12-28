import {
    getPackageJSON,
    resolvePkgPath,
    getBaseRollupPlugins
} from "./utils";
import generatePackageJson from 'rollup-plugin-generate-package-json';
import alias from "@rollup/plugin-alias";
const {
    name,
    module,
    peerDependencies
} = getPackageJSON('react-dom');
// react-dom包的路径
const pkgPath = resolvePkgPath(name);
// react-dom的产物路径
const pkgDistPath = resolvePkgPath(name, true);
export default [
    // react-dom
    {
        input: `${pkgPath}/${module}`,
        output: [{
                file: `${pkgDistPath}/index.js`,
                name: 'ReactDOM',
                format: 'umd'
            },
            {
                file: `${pkgDistPath}/client.js`,
                name: 'client',
                format: 'umd'
            },
        ],
        // 对于react-dom来说的外部包是可以不用打包进入reactDOM包的
        external: [
            'react-dom', // 该包不会打包进入react-dom, 则两者可以共用一个共享层
            'react'
        ],
        plugins: getBaseRollupPlugins()
    },
    // react-test-utils
    {
        input: `${pkgPath}/test-utils.ts`,
        output: [{
                file: `${pkgDistPath}/test-utils.js`,
                name: 'testUtils',
                format: 'umd'
            }
        ],
        // 对于react-dom来说的外部包是可以不用打包进入reactDOM包的
        external: [
            ...Object.keys(peerDependencies) // 该包不会打包进入react-dom, 则两者可以共用一个共享层
        ],
        plugins: [
            ...getBaseRollupPlugins(),
            // webpack resolve alias
            alias({
                entries: {
                    hostConfig: `${pkgPath}/src/hostConfig.ts`
                }
            }),
            generatePackageJson({
                inputFolder: pkgPath,
                outputFolder: pkgDistPath,
                baseContents: ({
                    name,
                    description,
                    version
                }) => ({
                    name,
                    description,
                    version,
                    peerDependencies: {
                        react: version
                    },
                    main: 'index.js'
                })
            })
        ]
    }
]
