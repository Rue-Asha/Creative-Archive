// Anything that must stay on the viewport (toasts, the phone selection dock) lives on <body>: `position: fixed` inside `.frame`
// follows the frame, because the frame's backdrop-filter makes it the containing block.
export function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		}
	};
}
