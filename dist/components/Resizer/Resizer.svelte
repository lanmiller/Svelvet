<script context="module">
	import { calculateFitContentWidth } from '../../utils';
	import { beforeUpdate, getContext, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { initialClickPosition, resizing } from '../../stores';
</script>

<script>
	const graph = getContext('graph');
	const node = getContext('node');
	const resized = getContext('resized');
	export let width = false;
	export let height = false;
	export let rotation = false;
	export let minHeight = 0;
	export let minWidth = 0;
	let DOMnode;
	let left = width;
	let right = width;
	let top = height;
	let bottom = height;
	let both = width && height;
	let startingRotation = 0;
	let initialClickAngle = 0;
	let initialNodePosition = get(node.position);
	const position = node.position;
	const resizingWidth = node.resizingWidth;
	const resizingHeight = node.resizingHeight;
	const rotating = node.rotating;
	const nodeRotation = node.rotation;
	const heightStore = node.dimensions.height;
	const widthStore = node.dimensions.width;
	const cursor = graph.cursor;
	let initialWidth;
	let initialHeight;
	let direction = 1;
	$: x = $position.x;
	$: y = $position.y;
	$: centerPoint = {
		x: x + $widthStore / 2,
		y: y + $heightStore / 2
	};
	$: if ($resizingHeight) {
		const initialClick = get(initialClickPosition);
		const cursorPosition = $cursor;
		const newHeight = Math.max(
			minHeight,
			initialHeight + (cursorPosition.y - initialClick.y) * direction
		);
		if (newHeight > minHeight) {
			resized.set(true);
			$heightStore = newHeight;
		} else {
			resized.set(false);
		}
		if (direction === -1) {
			$position = {
				x: initialNodePosition.x,
				y: initialNodePosition.y + cursorPosition.y - initialClick.y
			};
		}
		if ($nodeRotation !== 0) {
			node.position.update((pos) => {
				return {
					y: initialNodePosition.y - (newHeight - initialHeight) / 2,
					x: pos.x
				};
			});
		}
	}
	$: if ($resizingWidth) {
		const initialClick = get(initialClickPosition);
		const cursorPosition = $cursor;
		const newWidth = Math.max(
			minWidth,
			initialWidth + (cursorPosition.x - initialClick.x) * direction
		);
		if (newWidth > minWidth) {
			resized.set(true);
			$widthStore = newWidth;
		} else {
			resized.set(false);
		}
		if (direction === -1) {
			$position = {
				x: initialNodePosition.x + cursorPosition.x - initialClick.x,
				y: initialNodePosition.y
			};
		}
		if ($nodeRotation !== 0) {
			node.position.update((pos) => {
				return {
					x: initialNodePosition.x - (newWidth - initialWidth) / 2,
					y: pos.y
				};
			});
		}
	}
	$: if ($rotating) {
		$cursor;
		$nodeRotation = calculateRotation();
	}
	onMount(() => {
		try {
			DOMnode = document.querySelector(`#${node.id}`);
			if (DOMnode) [minWidth, minHeight] = calculateFitContentWidth(DOMnode);
		} catch (e) {
			console.error(e);
		}
	});
	function resizeHandler(node2, dimensions) {
		const setResize = (e) => {
			e.stopPropagation();
			e.preventDefault();
			if (dimensions.left || dimensions.top) {
				direction = -1;
			} else {
				direction = 1;
			}
			resizing.set(true);
			$initialClickPosition = get(cursor);
			initialWidth = $widthStore;
			initialHeight = $heightStore;
			initialNodePosition = $position;
			dimensions.both ? ($resizingWidth = true) : ($resizingWidth = false);
			$resizingWidth = dimensions.left || dimensions.right || dimensions.both || false;
			$resizingHeight = dimensions.top || dimensions.bottom || dimensions.both || false;
			if (DOMnode) [minWidth, minHeight] = calculateFitContentWidth(DOMnode);
			window.addEventListener('mouseup', removeResize);
		};
		const removeResize = () => {
			$resizingWidth = false;
			$resizingHeight = false;
			resizing.set(false);
			window.removeEventListener('mouseup', removeResize);
		};
		node2.addEventListener('mousedown', setResize);
		return {
			destroy() {
				node2.removeEventListener('mousedown', setResize);
			}
		};
	}
	function rotateHandler(node2) {
		const setRotation = (e) => {
			e.stopPropagation();
			e.preventDefault();
			startingRotation = $nodeRotation;
			$initialClickPosition = get(cursor);
			const initialDeltaX = $initialClickPosition.x - centerPoint.x;
			const initialDeltaY = $initialClickPosition.y - centerPoint.y;
			initialClickAngle = Math.atan2(initialDeltaY, initialDeltaX);
			$rotating = true;
			window.addEventListener('mouseup', removeRotation);
		};
		const removeRotation = () => {
			$rotating = false;
			window.removeEventListener('mouseup', removeRotation);
		};
		node2.addEventListener('mousedown', setRotation);
		return {
			destroy() {
				node2.removeEventListener('mousedown', setRotation);
			}
		};
	}
	function calculateRotation() {
		const cursorPosition = get(cursor);
		const currentDeltaX = cursorPosition.x - centerPoint.x;
		const currentDeltaY = cursorPosition.y - centerPoint.y;
		const currentAngle = Math.atan2(currentDeltaY, currentDeltaX);
		const angleDifference = initialClickAngle - currentAngle;
		const newAngle = startingRotation - radiansToDegrees(angleDifference);
		return newAngle;
	}
	function radiansToDegrees(radians) {
		return radians * (180 / Math.PI);
	}
	beforeUpdate(() => {
		if (DOMnode) [minWidth, minHeight] = calculateFitContentWidth(DOMnode);
		if ($widthStore < minWidth) resized.set(false);
		if ($heightStore < minHeight) resized.set(false);
	});
</script>

{#if width}
	<div use:resizeHandler={{ left }} class:width class="left" />
	<div use:resizeHandler={{ right }} class:width class="right" />
{/if}

{#if height}
	<div use:resizeHandler={{ top }} class:height class="top" />
	<div use:resizeHandler={{ bottom }} class:height class="bottom" />
{/if}
{#if both}
	<div use:resizeHandler={{ both }} class:both />
{/if}
{#if rotation}
	<div use:rotateHandler class:rotation />
{/if}

<style>
	* {
		position: absolute;
		width: 9px;
		height: 9px;
		z-index: 0;
		/* background-color: rgba(0, 0, 0, 0.419); */
		pointer-events: auto;
	}

	.width {
		height: calc(100% - 3px);
		top: -3px;
		cursor: col-resize;
	}

	.left {
		left: -3px;
	}
	.right {
		right: -3px;
	}
	.height {
		width: calc(100% - 3px);
		left: -3px;
		cursor: row-resize;
	}

	.top {
		top: -3px;
	}
	.bottom {
		bottom: -3px;
	}
	.both {
		bottom: -3px;
		right: -3px;
		cursor: nwse-resize;
		/* background-color: green; */
	}
	.rotation {
		top: -3px;
		left: -3px;
		cursor: crosshair;
		/* background-color: blue; */
	}
</style>
