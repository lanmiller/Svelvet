<script>
	import Slider from '../data/Slider/Slider.svelte';
	import TextField from '../data/TextField/TextField.svelte';
	import { writable } from 'svelte/store';
	import { Resizer } from '../..';
	import { getContext, setContext } from 'svelte';
	import Node from '../Node/Node.svelte';
	export let editing;
	const graph = getContext('graph');
	setContext('graph', graph);
	setContext('textStore', editing.label);
	setContext('colorStore', editing.bgColor);
	let editorPosition = { x: 150, y: 50 };
	let resizeOptions = { width: 10, height: 10 };
	$: cursor = graph.cursor;
	function handleContextMenu(event) {
		event.preventDefault();
		editorPosition = { x: event.clientX, y: event.clientY };
		graph.editing.set(editing);
	}
	function deleteNode() {
		graph.nodes.delete(editing.id);
		graph.editing.set(null);
	}
	function resizeNode() {
		const nodeId = editing.id;
		const node = graph.nodes.get(nodeId);
		if (node) {
			const currentWidth = node.dimensions.width;
			const currentHeight = node.dimensions.height;
			const newWidth = prompt(
				'Enter new width (for example:250):',
				currentWidth ? currentWidth.toString() : ''
			);
			const newHeight = prompt(
				'Enter new height (for example:200):',
				currentHeight ? currentHeight.toString() : ''
			);
			if (newWidth === null || newHeight === null) {
				return;
			}
			node.dimensions.width.set(parseInt(newWidth, 10) || 0);
			node.dimensions.height.set(parseInt(newHeight, 10) || 0);
			node.resizingWidth.set(true);
			node.resizingHeight.set(true);
		}
	}
</script>

<Node zIndex={Infinity} position={editorPosition} bgColor="white" id="editor">
	<!-- svelte-ignore a11y-no-static-element-interactions -->

	<div on:contextmenu={handleContextMenu} class="editor">
		<span style="color:white; font-size:45px">Editor</span>
		<button on:click={() => graph.editing.set(null)} style="position:absolute; top:10px;right:10px;"
			>X</button
		>
		<!-- <Slider parameterStore={editing.dimensions.width} max={1000} label="" /> -->
		<TextField placeholder={'Node Label'} />
		<button on:click={deleteNode}>Delete Node</button>
		<button on:click={resizeNode}>Resize Node</button>
	</div>
</Node>

<style>
	div {
		--shadow-color: 0deg 0% 0%;
		--shadow-elevation-high: 0px 0.6px 0.6px hsl(var(--shadow-color) / 0.12),
			0.1px 2.5px 2.5px -0.5px hsl(var(--shadow-color) / 0.11),
			0.2px 4.7px 4.8px -0.9px hsl(var(--shadow-color) / 0.11),
			0.4px 8.2px 8.3px -1.4px hsl(var(--shadow-color) / 0.1),
			0.6px 14px 14.2px -1.9px hsl(var(--shadow-color) / 0.09),
			1px 22.9px 23.2px -2.3px hsl(var(--shadow-color) / 0.09),
			1.5px 35.9px 36.4px -2.8px hsl(var(--shadow-color) / 0.08),
			2.3px 53.9px 54.6px -3.2px hsl(var(--shadow-color) / 0.07);
		border: solid 1px rgb(153, 153, 153);
		position: absolute;
		border-radius: 6px;
		z-index: 100;
		width: 150px;
		padding: 10px;
		height: 200px;
		background-color: rgb(243, 237, 237);
		box-shadow: var(--shadow-elevation-high);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 4rem;
		gap: 10px;
	}

	.editor {
		background-color: rgb(108, 233, 35);
		width: 250px;
		height: 200px;
		justify-content: space-evenly;
	}
</style>
