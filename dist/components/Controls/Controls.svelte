<script>
	import { getContext } from 'svelte';
	import { get } from 'svelte/store';
	import { calculateFitView } from '../../utils';
	import { zoomAndTranslate } from '../../utils/movers';
	import { tracking } from '../../stores';
	import Icon from '../../assets/icons/Icon.svelte';
	export let increment = 0.1;
	export let horizontal = false;
	export let bgColor = null;
	export let iconColor = null;
	export let corner = 'SW';
	const transforms = getContext('transforms');
	const dimensions = getContext('dimensions');
	const locked = getContext('locked');
	const groups = getContext('groups');
	const bounds = getContext('bounds');
	const { translation } = transforms;
	const hidden = $groups.hidden.nodes;
	const nodeBounds = bounds.nodeBounds;
	function unhideAll() {
		hidden.set(/* @__PURE__ */ new Set());
	}
	function zoomIn() {
		zoomAndTranslate(-1, dimensions, transforms, increment);
	}
	function zoomOut() {
		zoomAndTranslate(1, dimensions, transforms, increment);
	}
	function fitView() {
		tracking.set(true);
		const { x, y, scale } = calculateFitView(get(dimensions), get(nodeBounds));
		translation.set({ x: x || 0, y: y || 0 });
		transforms.scale.set(scale || 1);
		tracking.set(false);
	}
	function lock() {
		locked.set(!$locked);
	}
</script>

<nav class="graph-controls {corner}" aria-label="navigation">
	<!-- <nav
	class="graph-controls"
	class:SW={corner === 'SW'}
	class:NE={corner === 'NE'}
	class:SE={corner === 'SE'}
	class:NW={corner === 'NW'}
	aria-label="navigation"
> -->
	<slot {zoomIn} {zoomOut} {fitView} {lock} {unhideAll}>
		<div
			class="controls-wrapper"
			class:horizontal
			style:--prop-controls-background-color={bgColor}
			style:--prop-controls-text-color={iconColor}
		>
			{#if get(hidden).size > 0}
				<!-- {#if $hidden.size > 0} -->
				<button class="unhide" on:mousedown|stopPropagation={unhideAll}>
					<Icon icon="visibility_off" />
				</button>
			{/if}
			<button class="zoom-in" on:pointerdown|stopPropagation={zoomIn}>
				<!-- <button class="zoom-in" on:mousedown|stopPropagation={zoomIn} on:touchstart={zoomIn}> -->
				<Icon icon="zoom_in" />
			</button>
			<button class="zoom-out" on:mousedown|stopPropagation={zoomOut} on:touchstart={zoomOut}>
				<Icon icon="zoom_out" />
			</button>
			<button class="reset" on:mousedown|stopPropagation={fitView} on:touchstart={fitView}>
				<Icon icon="filter_center_focus" />
			</button>
			<button class="lock" on:mousedown|stopPropagation={lock} on:touchstart={lock}>
				<Icon icon={$locked ? 'lock' : 'lock_open'} />
			</button>
		</div>
	</slot>
</nav>

<style>
	* {
		box-sizing: border-box;
	}

	.graph-controls {
		position: absolute;
	}

	.NW {
		left: 10px;
		top: 10px;
	}

	.NE {
		right: 10px;
		top: 10px;
	}

	.SE {
		right: 10px;
		bottom: 10px;
	}

	.SW {
		left: 10px;
		bottom: 10px;
	}
	.controls-wrapper {
		left: 10px;
		bottom: 10px;
		display: flex;
		width: 1.8rem;
		flex-direction: column;
		border-radius: 6px;
		overflow: hidden;
		box-shadow: var(--controls-shadow, var(--default-controls-shadow));
		border: solid 1px var(--controls-border, var(--default-controls-border));
		padding: 4px;
		color: var(
			--prop-controls-text-color,
			var(--controls-text-color, var(--default-controls-text-color))
		);
		background-color: var(
			--prop-controls-background-color,
			var(--controls-background-color, var(--default-controls-background-color))
		);
	}

	/* reset button */
	button {
		margin: 0;
		padding: 0;
		border: none;
		background: none;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.2rem 0;
		border-bottom: solid 1px rgb(190, 188, 188);
		color: inherit;
	}

	.horizontal > button {
		border-bottom: none;
	}

	button:last-child {
		border-bottom: none;
	}
	button:hover {
		cursor: pointer;
	}

	.horizontal {
		flex-direction: row-reverse !important;
		height: 1.5rem;
		gap: 6px;
		width: fit-content;
	}
</style>
