// 存放fiberNode数据结构
import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';
// fiberNode
export class FiberNode {
	// 表示实例
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	stateNode: any; // 保存宿主环境节点
	ref: Ref;

	memoizedProps: Props | null; // 确定下来的props
	memoizedState: any; // 更新完成后的新的state；用于保存hook的链表，该字段指向hook链表中的第零个hook,第零个hook内部还有next字段指向下一个hook

	// 描述fiberNode之间的关系
	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	alternate: FiberNode | null; // 用于fiberNode和另一个fiberNode之间切换；双缓冲技术的的标记
	flags: Flags; // fiberNode的标记，用于标记该fiberNode是应该被删除还是新增还是更改
	subtreeFlags: Flags; // 代表其子树中包含的flags
	updateQueue: unknown;
	deletions: FiberNode[] | null;
	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// ** 实例 **
		this.tag = tag;
		this.key = key;
		// 如果组件是元节点HostComponent <div>则该变量保存div的DOM
		this.stateNode = null;
		// FiberNode的类型，如FunctionComponent() => {}
		this.type = null;

		// ** 作为树状结构 **
		this.return = null; // 指向父级fiberNode
		this.sibling = null;
		this.child = null;
		this.index = 0; // 同级fiberNode多个时定义其所在索引

		this.ref = null;

		// ** 作为工作单元 **
		this.pendingProps = pendingProps; // 刚开始准备时的props
		this.memoizedProps = null; // 确定下来的props
		this.memoizedState = null;
		this.alternate = null; // 用于双缓冲技术，current和workInProgress, 如果当前是current显示，则指向workInProgress, 反之亦然。
		this.updateQueue = null;
		// 作为副作用
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags; // 子树中包含的flags
		this.deletions = null;
	}
}

export class FiberRootNode {
	container: Container; // 保存原生宿主环境节点
	current: FiberNode;
	finishWork: FiberNode | null; // 已经更新递归完成后的hostFiber
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;
	if (wip === null) {
		// 首屏渲染
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.type = current.type;
		wip.stateNode = current.stateNode;

		// 互相指责
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// 更新
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
		wip.deletions = null;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;
	return wip;
};

// 根据element创建fiber
export function createFiberFromElement(element: ReactElementType) {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		// <div /> type: 'div'
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
