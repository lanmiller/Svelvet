<script>
	import { onMount } from 'svelte';
	import { cursorPositionRaw } from '../../stores/CursorStore';
	export let graph;
	export let anchor;
	export let adding = false;
	export let creating = false;
	export let color = null;
	const { groups } = graph;
	let nodes;
	let box;
	$: selectedNodes = $groups.selected.nodes;
	$: height = $cursorPositionRaw.y - anchor.y - anchor.top;
	$: width = $cursorPositionRaw.x - anchor.x - anchor.left;
	$: top = Math.min(anchor.y, anchor.y + height);
	$: left = Math.min(anchor.x, anchor.x + width);
	$: CSStop = `${top}px`;
	$: CSSleft = `${left}px`;
	$: CSSheight = `${Math.abs(height)}px`;
	$: CSSwidth = `${Math.abs(width)}px`;
	$: if (width || height) {
		selectNodes();
	}
	onMount(updateNodes);
	function updateNodes() {
		const DOMnodes = Array.from(document.querySelectorAll('.svelvet-node'));
		nodes = DOMnodes.map((node) => {
			const {
				top: top2,
				left: left2,
				width: width2,
				height: height2
			} = node.getBoundingClientRect();
			return { id: node.id, top: top2, left: left2, width: width2, height: height2 };
		});
	}
	function selectNodes() {
		if (!nodes) return;
		const nodesUnderSelection = nodes.reduce((accumulator, node) => {
			if (
				left + anchor.left <= node.left &&
				top + anchor.top <= node.top &&
				left + anchor.left + Math.abs(width) >= node.left + node.width &&
				top + anchor.top + Math.abs(height) >= node.top + node.height
			) {
				const id = node.id;
				const selectedNode = graph.nodes.get(id);
				if (!selectedNode) return accumulator;
				accumulator.push(selectedNode);
			}
			return accumulator;
		}, []);
		if (adding) {
			nodesUnderSelection.forEach((node) => {
				$selectedNodes.add(node);
			});
		} else {
			$selectedNodes = new Set(nodesUnderSelection);
		}
		$selectedNodes = $selectedNodes;
	}
</script>

<div
	class="selection-border"
	style:--prop-selection-box-color={color}
	style:height={CSSheight}
	style:width={CSSwidth}
	style:top={CSStop}
	style:left={CSSleft}
	class:creating
>
	<div class:creating bind:this={box} class="selection-box" />
</div>

<style>
	.selection-box,
	.selection-border {
		border-radius: 5px;
	}
	.selection-box {
		width: 100%;
		height: 100%;
		opacity: 20%;
		background-color: var(
			--prop-selection-box-color,
			var(--selection-box-color, var(--default-selection-box-color))
		);
	}

	.selection-border {
		position: absolute;
		border-radius: 5px;
		pointer-events: none;
		z-index: 100;
		cursor: crosshair;
		border: 1px dashed;
		border-color: var(
			--prop-selection-box-color,
			var(--selection-box-color, var(--default-selection-box-color))
		);
	}

	.selection-box.creating {
		background-color: rgba(220, 189, 13, 0.438);
	}

	.selection-border.creating {
		border: 1px solid goldenrod;
	}
</style>
