import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { complateWork } from './complateWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

let workInProgress: FiberNode | null = null; // current, workInProgress，双缓冲技术之一分支

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

// 在fiber中调度update
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	const root = markUpdateFromFiberToRoot(fiber); // 拿到根节点
	renderRoot(root); // 从根节点开始更新
}

// 接受fiberNode, 找到根节点RootFiberNode并返回
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if ((node.tag = HostRoot)) {
		return node.stateNode; // 格式参考（docs/images/rootFiberNode-fiberNode-指向关系.jpg）
	}
	return null;
}

function renderRoot(root: FiberRootNode) {
	// 初始化
	prepareFreshStack(root);
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop错误', e);
			}
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
	// root的flags（root本身是否有副作用，是否操作增删改）中和root的subtreeFlags（root的子孙是否有副作用，是否操作增删改之类的）中是否包含了Mutation阶段需要执行的一些操作
	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
	if (subtreeHasEffect || rootHasEffect) {
		// 如果有，则
		// beforeMutaion
		// mutation Placement
		commitMutationEffects(finishedWork);
		// （本次更新要执行的commit阶段的任务：fiber树的切换，执行Placement对应操作，介于mutation和layout之间）
		root.current = finishedWork; // finishedWork是本次更新生成的workInProgressFiber树
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
}
