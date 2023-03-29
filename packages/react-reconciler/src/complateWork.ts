/**
 * 1. completeWork需要解决的问题：
 * 对于Host类型的fiberNode, 构建离屏DOM树
 * 标记update Flag
 * 2. 性能优化：flags分布在不同fiberNode中，如何快速找到他们？
 * 利用completeWork向上遍历（归）的流程，将子fiberNode的flags冒泡到父fiberNode
 */
import { FiberNode } from './fiber';
import { NoFlags, Update } from './fiberFlags';
import {
	appendInitialChild,
	Container,
	createInstance,
	createTextInstance
} from 'hostConfig';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { updateFiberProps } from 'react-dom/src/SyntheticEvent';

// 标记更新
function markUpdate(fiber: FiberNode) {
	fiber.flags |= Update;
}
export const complateWork = (wip: FiberNode) => {
	// 递归中的回溯阶段
	const newProps = wip.pendingProps;
	const current = wip.alternate;
	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// stateNode保存的是DOM节点
				// update
				// 1. props属性是否变化如className, style, {onClick: xx} => {onClick: xxx}
				// 2.变了Update flag
				updateFiberProps(wip.stateNode, newProps);
			} else {
				// mount
				// 1.构建dom
				const instance = createInstance(wip.type, newProps); // 创建拿到一个DOM节点
				// 2.将dom插入到dom树中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// update
				const oldText = current.memoizedProps.content;
				const newText = newProps.content;
				if (oldText !== newText) {
					markUpdate(wip);
				}
			} else {
				// mount
				// 1.构建dom
				const instance = createTextInstance(newProps.content); // 创建的是一个文本节点
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
		case FunctionComponent:
			bubbleProperties(wip);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的complateWork情况', wip);
			}
			break;
	}
};

function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			// 递进
			// 往下进一层，把自己当做父亲，子孙节点当做自己
			node.child.return = node;
			node = node.child;
			continue;
		}
		if (node === wip) {
			// 终止条件
			return;
		}
		while (node?.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			// 回溯阶段
			node = node?.return;
		}
		// 跟子孙节点设置是一样的
		node.sibling.return = node?.return;
		node = node?.sibling;
	}
}

/**
 * complateWork的性能优化策略
 * flags分布到不同的fiberNode中，如何找到他们
 * 利用completeWork流程的向上归并阶段将子fiberNode的flags冒泡到父fiberNode
 * @param wip
 */
function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		subtreeFlags |= child.subtreeFlags; // 按位或
		subtreeFlags |= child.flags;
		// 处理遍历对象
		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
