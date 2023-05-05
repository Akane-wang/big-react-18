// 存放fiberNode数据结构
import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';
/** fiberNode包含三层含义
 * 架构：v15: 栈调和
 * 		v16: fiber reconciler
 * 静态数据结构：存储React元素的类型，对应的DOM元素等信息
 * 动态的工作单元：保存更新中该React元素变化的数据，要执行的工作（增删改，更新ref, 副作用等）
 * */
export class FiberNode {
	// * 表示实例(静态数据结构)
	// elementType: any; // TODO：书上有这个但是视频里没有.大部分情况同type，某些情况不同，FunctionComponent使用React.memo包裹；
	type: any; // FunctionComponent=>function; ClassComponent=> class; HostComponent=> DOM
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	stateNode: any; // 保存宿主环境节点
	ref: Ref;

	memoizedProps: Props | null; // 确定下来的props
	memoizedState: any; // 更新完成后的新的state；用于保存hook的链表，该字段指向hook链表中的第零个hook,第零个hook内部还有next字段指向下一个hook

	// * 描述fiberNode之间的关系
	return: FiberNode | null; // 指向父fibernode
	sibling: FiberNode | null; // 指向右边的兄弟FiberNode
	child: FiberNode | null; // 指向第一个子FiberNode
	index: number;
	// * 与动态工作单元相关
	flags: Flags; // fiberNode的标记，用于标记该fiberNode是应该被删除还是新增还是更改
	subtreeFlags: Flags; // 代表其子树中包含的flags
	deletions: FiberNode[] | null; // 要删除的fiberNode数组

	updateQueue: unknown; // 变化的属性的key、value
	// * 与优先级调度相关
	// lanes: ;
	// childLanes:;
	// *与Fiber架构的工作原理相关
	alternate: FiberNode | null; // 用于fiberNode和另一个fiberNode之间切换；双缓冲技术的的标记

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
/**
 * 负责管理该应用的全局事宜
 * 1.current fiber tree 与 wip fiber tree 之间的切换（双缓存机制）
 * 2.应用中任务的过期时间
 * 3.应用的任务调度信息
 */
export class FiberRootNode {
	container: Container; // 保存原生宿主环境节点
	current: FiberNode;
	finishWork: FiberNode | null; // 已经更新递归完成后的hostFiber
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this; // 当前的fiberRootNode, 里面有container，current, 现在把current添加stateNode并指向他自己
		this.finishWork = null; //? 这个用来干嘛？
	}
}

// 创建workInProgress; 即wip, 即alternate指向的那棵后缓冲区的fibber树
export const createWorkInProgress = (
	current: FiberNode, // hostRootFiber
	pendingProps: Props // {}
): FiberNode => {
	let wip = current.alternate; // 初始时，alternate是没有的
	if (wip === null) {
		// 首屏渲染mount
		wip = new FiberNode(current.tag, pendingProps, current.key); // hostRoot, {}, null
		wip.type = current.type;
		wip.stateNode = current.stateNode; // 指向fiberRootNode

		// 互相指责(fiberRootNode的两棵前后缓冲区树)
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
	wip.memoizedProps = current.memoizedProps; // ?
	wip.memoizedState = current.memoizedState; // ?
	return wip;
};

// 根据element创建fiber
export function createFiberFromElement(element: ReactElementType) {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent; // !(根据type的值做了对应的改动，md)为什么就这么断定是functionComponent?我觉得这里后面肯定是会改动的，因为我们这里处理的是函数组件，如果是classComponent肯定要改
	if (typeof type === 'string') {
		// ? 这里是怎么拿到div的
		// !应该是babel做的处理，一开始就jsx编译成了ReactElement对象,所以type=div
		// <div /> type: 'div'
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
