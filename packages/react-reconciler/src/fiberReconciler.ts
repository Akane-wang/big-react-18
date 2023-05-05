import { Container } from 'hostConfig';
import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, FiberRootNode } from './fiber';
import {
	createUpdate,
	createUpdateQueue,
	enqueUpdate,
	UpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { HostRoot } from './workTags';

export function createContainer(container: Container) {
	// 拿到一个空FiberNode，该fiberNode表明tag=3:是hostRoot的节点；
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);

	hostRootFiber.updateQueue = createUpdateQueue(); // 返回这个东西：{shared: {padding: null; } dispatch: null }
	return root;
}

export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	const update = createUpdate<ReactElementType | null>(element); //? 创建这个东西用来干嘛？？为什么拿到的东西那么奇怪？
	enqueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	); // 把updateQueue.shared.pending = update;相当于是塞了一个update实例进去
	scheduleUpdateOnFiber(hostRootFiber);
	return element;
}
