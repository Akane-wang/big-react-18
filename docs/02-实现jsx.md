# 实现 jsx

### 是什么

- 17 之前是 createElement

- 17 之后是 jsx

jsx 转换包括两部分

- 编译时： 由 babel 实现
- 运行时：
  - 实现 jsx 方法
    - jsxDEV(dev 环境)
    - jsx(prod 环境)
    - React.createElment 方法
  - 实现打包流程
    - react/jsx-dev-runtime.js(dev 环境)
    - react/jsx-runtime.js(prod 环境)
    - React
    ```js
     打包流程即用 rollup 实现打包结果，对应代码见 scripts/rollup/react.config.js;
     命令见主目录下的 package.json 的命令语句：`npm run build:dev`
      rimraf 是为了兼容 window 系统，如果是 mac 系统可以直接 `rm -rf dist` 用于清除 dist 目录；`--bundleConfigAsCjs` 是因为 rollup 支持的是 commonjs，该命令可以将 es 代码转为 commonjs 实现打包
    ```
  - 实现调试打包结果的环境
