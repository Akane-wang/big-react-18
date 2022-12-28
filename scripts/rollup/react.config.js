import {
    getPackageJSON,
    resolvePkgPath,
    getBaseRollupPlugins
} from "./utils";
import generatePackageJson from 'rollup-plugin-generate-package-json';
const {
    name,
    module
} = getPackageJSON('react');
const pkgPath = resolvePkgPath(name);
const pkgDistPath = resolvePkgPath(name, true);
export default [
    // react
    {
        input: `${pkgPath}/${module}`,
        output: {
            file: `${pkgDistPath}/index.js`,
            name: 'React',
            format: 'umd'
        },
        plugins: [...getBaseRollupPlugins(), generatePackageJson({
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
                name: 'index.js'
            })
        })]
    },
    // jsx-runtime
    {
        input: `${pkgPath}/src/jsx.ts`,
        output: [{
                // jsx-runtime
                file: `${pkgDistPath}/jsx-runtime.js`,
                name: 'jsx-runtime',
                formate: 'umd'
            },
            {
                // jsx-runtime
                file: `${pkgDistPath}/jsx-dev-runtime.js`,
                name: 'jsx-dev-runtime',
                formate: 'umd'
            },
        ],
        plugins: getBaseRollupPlugins()
    }
]
