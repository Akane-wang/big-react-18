# 实现 commit 阶段

- react 内部三个阶段

  - schedule
  - render(beginWork, completeWork)
  - commit(commitWork)
  - commit 三个阶段
    - beforeMutacion
    - mutation(突变，改变 ui 的一种方式)
    - layout

- fiber 树的切换
- 执行 placement 对应操作

## 打包 ReactDOM

- 兼容原版 React 导出
- 处理 hostConfig 的指向

## dependence 和 peerDependencies 的区别

- dependencies: 当前模块的生产环境依赖
- peerDependencies: 默认在开发者的环境中已经存在了的，不会被安装
