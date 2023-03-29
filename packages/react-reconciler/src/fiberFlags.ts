export const NoFlags = 0b00000000000000000000000000;
export const Placement = 0b00000000000000000000000001;
export const Update = 0b00000000000000000000000010;
export const ChildDeletion = 0b00000000000000000000000100;

export type Flags = number;

export const MutationMask = Placement | Update | ChildDeletion; // mutation阶段需要执行的一些操作
