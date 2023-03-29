export const FunctionComponent = 0; // 函数节点
export const HostRoot = 3; // 挂载的根节点
export const HostComponent = 5; // 元节点

export const HostText = 6; // 文本节点

export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;
