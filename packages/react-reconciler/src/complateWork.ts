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
				// update
				// 1. props属性是否变化如className, style, {onClick: xx} => {onClick: xxx}
				// 2.变了Update flag
				updateFiberProps(wip.stateNode, newProps);
			} else {
				// mount
				// 1.构建dom
				const instance = createInstance(wip.type, newProps);
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
				const instance = createTextInstance(newProps.content);
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
			node.child.return = node;
			node = node.child;
			continue;
		}
		if (node === wip) {
			return;
		}
		while (node?.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node?.return;
		node = node?.sibling;
	}
}

function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		subtreeFlags |= child.subtreeFlags; // 按位或
		subtreeFlags |= child.flags;
		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
