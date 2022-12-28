import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
	Type,
	Key,
	Ref,
	Props,
	ReactElementType,
	ElementType
} from 'shared/ReactTypes';
// ReactElement
const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElementType {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		key,
		type,
		ref,
		props,
		__mark: 'wangqian'
	};

	return element;
};

export function isValidElement(object: any) {
	return (typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE);
}

export const jsx = (type: ElementType, config: any, ...args: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;
	for (const prop in config) {
		const val = config[prop];
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	const argsLeng = args.length;
	if (argsLeng) {
		// [child] [child, child]
		if (argsLeng === 1) {
			props.children = args[0];
		} else {
			props.children = args;
		}
	}

	return ReactElement(type, key, ref, props);
};

export const jsxDEV = jsx;
