import {
	createContainer,
	updateContainer
} from 'react-reconciler/src/fiberReconciler';
import { ReactElementType } from 'shared/ReactTypes';
import { Container } from 'hostConfig';
import { initEvent } from './SyntheticEvent';

// ReactDOM.createRoot(root).render(<app/>)
export function createRoot(container: Container) {
	const root = createContainer(container); // 拿到的结果是一棵fiberRootNode树，里面有hostRootFiber:{stateNode: FiberRootNode; updateQueue: {shared: {peding: null}, dispatch: null}}、container、current=> hostRootFiber;
	return {
		render(element: ReactElementType) {
			initEvent(container, 'click');
			return updateContainer(element, root);
		}
	};
}
