# 实现 reconciler 架构

reconciler 是 React 的核心模块，中文名叫协调器，协调就是 diff 算法的意思

- reconcile 的作用
  - 消费 jsx
  - 没有编译优化
  - 开放通用 api 给不同宿主使用
    ![reconcile-jquery](./images/reconciler.png)
- 核心模块消费 jsx 的过程
  ![消费jsx的过程](./images/reconcile-fiber.jpg)
- 数据结构对比
  ![reactElement-fiberNode](./images/reactElement-fiberNode-shortcoming-advantage.jpg)
