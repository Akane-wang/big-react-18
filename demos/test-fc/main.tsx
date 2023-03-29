import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
function App() {
	const [num, setNum] = useState(100);
	// return (
	// 	<div>
	// 		<Child />
	// 	</div>
	// );
	return <div onClick={() => setNum(num + 1)}>{num}</div>;
}

function Child() {
	return <span>demo嘞</span>;
}

const jsx = (
	<div>
		hello
		<Child />
		<span>big-react</span>
	</div>
);
console.log(jsx);
console.log(React);
const root = document.getElementById('root') as HTMLElement;
ReactDOM.createRoot(root).render(<App />);
