import { beginWork } from './beginWork';
import { complateWork } from './complateWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

let workInProgress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

// 在fiber中调度update
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

// 接受当前的fiber
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if ((node.tag = HostRoot)) {
		return node.stateNode;
	}
	return null;
}
function renderRoot(root: FiberRootNode) {
	// 初始化
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.warn('workLoop错误', e);
			workInProgress = null;
		}
	} while (true);
	const finishWork = root.current.alternate;
	root.finishWork = finishWork;
	// wip fiberNode树，树中的flags
	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	// 包括三个阶段
	// beforeMutation阶段
	// mutation阶段
	// layout阶段
	const finishedWork = root.finishWork;
	if (finishedWork === null) {
		return;
	}
	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}
	// 重置
	root.finishWork = null;
	// 判断是否存在三个子阶段需要执行的操作
	// root flags root subtreeFlags
	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutaion
		// mutation Placement
		root.current = finishedWork;
		// layout
	} else {
		root.current = finishedWork;
	}
}
function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		complateUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

function complateUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		complateWork(node);
		const sibling = node.sibling;

		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		node = node.return;
		workInProgress = node;
	} while (node !== null);
	{
	}
}
