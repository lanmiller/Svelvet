<script>
	import { onMount } from 'svelte';
	export let node;
	export let hidden = false;
	export let toggleHidden;
	export let top;
	export let left;
	export let nodeColor = null;
	export let hideable;
	const { position, dimensions, bgColor, borderRadius, rotation } = node;
	const { width, height } = dimensions;
	$: nodePosition = $position;
	$: nodeRotation = $rotation;
	$: zIndex = node.zIndex;
	let color = null;
	$: colorIsTransparent = color === 'rgba(0, 0, 0, 0)';
	onMount(() => {
		try {
			const DOMnode = document.querySelector(`#${node.id}`)?.firstChild;
			if (DOMnode) {
				color = window.getComputedStyle(DOMnode).backgroundColor;
			}
		} catch (e) {
			console.error(e);
		}
	});
</script>

<button
	on:click={() => {
		if (!hideable) return;
		toggleHidden(node);
	}}
	class:hidden
	class="minimap-node"
	style:z-index={$zIndex}
	style:border-radius="{$borderRadius}px"
	style:--prop-background-color={nodeColor || $bgColor || (!colorIsTransparent && color) || null}
	style:width="{$width}px"
	style:height="{$height}px"
	style:transform="rotate({nodeRotation}deg)"
	style:top="{nodePosition.y - top}px"
	style:left="{nodePosition.x - left}px"
	class:hideable
/>

<style>
	* {
		box-sizing: border-box;
	}
	.minimap-node {
		position: absolute;
		border: none;
		background-color: var(
			--prop-background-color,
			var(--minimap-node-color, var(--default-minimap-node-color))
		);
	}
	.hidden {
		opacity: 25%;
	}

	.hideable {
		cursor: pointer;
	}
</style>
