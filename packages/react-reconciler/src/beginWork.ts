/**
 * 实现host相关节点的beginWork
 * 1.HostRoot
 * 计算状态的最新值，创建子fiberNode
 * 2.HostComponent
 * 创建子fiberNode
 * 3.HostText
 * 性能优化：
 * 构建好离屏DOM树，再执行一次操作如Placement等
 */
import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { FiberNode } from './fiber';
import { renderWidthHooks } from './fiberHooks';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';

// 递归中的递阶段
export const beginWork = (wip: FiberNode) => {
	// TODO:省略代码update时判断是否可复用（书上写的）
	// if (current !== null) {
	// 	//
	// } else {
	// 	// 省略代码
	// }
	// 返回子节点
	switch (wip.tag) {
		case HostRoot: // ? 为什么会是这个tag?为什么要在一开始就塞这个去创建fiberNode?
			return updateHostRoot(wip);
		case HostComponent: // 原生类型： div、span
			return updateHostComponent(wip);
		case HostText: // 文本元素类型
			return null;
		case FunctionComponent: // update时禁止functionComponent分支
			return updateFunctionComponent(wip);
		// TODO:暂未实现以下类型
		// case ClassComponent:
		// case LazyComponent:
		// case IndeterminateComponent: // FC mount时进入的分支
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型');
			}
			break;
	}
	return null;
};

function updateFunctionComponent(wip: FiberNode) {
	const nextChildren = renderWidthHooks(wip); // 执行FunctionComponent的type,拿到函数组件的执行结果
	reconcileChildren(wip, nextChildren);
	return wip.child;
}
function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>; // 在执行ReactDOM.createRoot(root).render(<app />)的时候，render返回的一个updateContainer()里面塞入了一个action
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending); // action is function ? function(action) : action
	wip.memoizedState = memoizedState; // ReactElement; 这里取出了action对象
	const nextChildren = wip.memoizedState; // ? 不知道这里还会不会改，不然一个action叫nextChildren有点奇怪？
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

// 常见类型（ClassComponent, FunctionComponent, HostComponent）没有命中优化策略，会进入reconcileChildren方法
function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate; // hostRootFiber.alternate在创建wip的时候就指明不为null了
	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// mount
		wip.child = mountChildFibers(wip, null, children);
	}
}
