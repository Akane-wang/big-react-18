import { FiberNode } from './fiber';
import internals from 'shared/internals'; // 内部数据共享层
import { Dispatcher, Dispatch } from 'react/src/currentDispatcher';
import {
	createUpdate,
	createUpdateQueue,
	enqueUpdate,
	processUpdateQueue,
	UpdateQueue
} from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';

/**
 * hook如何知道自己的数据会保存到哪里？
 * currentlyRenderingFiber变量，用于记录当前render的FC对应的fiberNode,在fiberNode中保存hook数据
 */
let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null; // 指向当前正在处理的hook, 类似于workInProgeress
let currentHook: Hook | null = null;

const { currentDispatcher } = internals; // 解构

// 链表，数据结构格式不能变，否则获取的数据就不是原来的数据
interface Hook {
	// 存储的是所有的hook共享该接口，useState, useEffect，所以要比较抽象
	memoizedState: any; // 保存hook自身状态值
	updateQueue: unknown; // 触发更新
	next: Hook | null; // 指向下一个hook
}

// 处理函数组件（functionComponent)
export function renderWidthHooks(wip: FiberNode) {
	currentlyRenderingFiber = wip; // 赋值操作
	// 重置
	wip.memoizedState = null; // memoizedState保存hooks的链表

	const current = wip.alternate;

	if (current !== null) {
		// update
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		// mount
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = wip.type; // 函数组件就是type()
	const props = wip.pendingProps;
	const children = Component(props); // FC render；我觉得这里应该是因为内部处理了jsx,createElement那个操作，babel处理的

	// 重置操作 ↓
	currentlyRenderingFiber = null;
	workInProgressHook = null;
	currentHook = null;
	return children;
}

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};

const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState
};

function mountState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
	// 找到当前useState对应的hook数据
	const hook = mountWorkInProgressHook();

	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}

	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	hook.memoizedState = memoizedState;
	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue); // dispatchSetState已经保存对应的fiber节点
	queue.dispatch = dispatch;
	return [memoizedState, dispatch];
}

function updateState<State>(): [State, Dispatch<State>] {
	// 找到当前useState对应的hook数据
	const hook = updateWorkInProgressHook();

	// 实现updateState中计算新的state的逻辑
	const queue = hook.updateQueue as UpdateQueue<State>; // 依据保存在queue里
	const pending = queue.shared.pending;

	if (pending !== null) {
		const { memoizedState } = processUpdateQueue(hook.memoizedState, pending); // memoizedState保存其hook状态
		hook.memoizedState = memoizedState;
	}
	return [hook.memoizedState, queue.dispatch as Dispatch<State>];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const update = createUpdate(action); // 创建update
	enqueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber); // 从fiber开始调度更新
}

/**
 * 这里实现的就是hook链表那一部分；
 * fiberNode的memoizedState存储Hook链表，指向hook第一个；
 * 设置一个workInProgressHook存储当前指向的Hook
 * @returns
 */
function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};

	if (workInProgressHook === null) {
		// mount时第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内使用hook');
		} else {
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}
	return workInProgressHook;
}

function updateWorkInProgressHook(): Hook {
	// TODO：render阶段触发的更新
	// hooks数据从哪儿来？=> 从currentHook数据中来
	// 交互阶段触发更新
	// render阶段触发更新
	let nextCurrentHook: Hook | null; // 用来保存下一个hook
	if (currentHook === null) {
		// 这是这个FC update时的第一个hook
		const current = currentlyRenderingFiber?.alternate;
		if (current !== null) {
			nextCurrentHook = current?.memoizedState;
		} else {
			// mount
			nextCurrentHook = null;
		}
	} else {
		// 这个FC update时后续的hook
		nextCurrentHook = currentHook.next;
	}

	if (nextCurrentHook === null) {
		// mount/update u1, u2, u3
		// update       u1, u2, u3, u4
		// u4如何会多一个？
		// if(xxx) { useState() } // u4的来源
		throw new Error(
			`组件${currentlyRenderingFiber?.type}本次执行时的hook比上次执行时多`
		);
	}

	currentHook = nextCurrentHook as Hook;
	const newHook: Hook = {
		memoizedState: currentHook.memoizedState,
		updateQueue: currentHook.updateQueue,
		next: null
	};

	if (workInProgressHook === null) {
		// mount时第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内使用hook');
		} else {
			workInProgressHook = newHook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		workInProgressHook.next = newHook;
		workInProgressHook = newHook;
	}

	return workInProgressHook;
}
