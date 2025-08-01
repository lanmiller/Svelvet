<script>
	import { DOT_WIDTH, GRID_SCALE } from '../../constants';
	import { getContext } from 'svelte';
	const graph = getContext('graph');
	export let style = 'dots';
	export let gridWidth = GRID_SCALE;
	export let dotSize = DOT_WIDTH;
	export let bgColor = null;
	export let dotColor = null;
	export let opacityThreshold = 3;
	export let majorGrid = 0;
	export let minOpacity = 0.4;
	const transforms = graph.transforms;
	const scaleStore = transforms.scale;
	const translationStore = transforms.translation;
	let backgroundWrapper;
	let svgWidth;
	let svgHeight;
	let backgroundOffsetX;
	let backgroundOffsetY;
	let gridOpacity = 1;
	let majorGridOpacity = 1;
	$: graphTranslation = $translationStore;
	$: scale = $scaleStore;
	$: gridScale = scale * gridWidth;
	$: radius = (scale * dotSize) / 2;
	$: dotCenterCoordinate = gridScale / 2;
	$: {
		svgWidth = backgroundWrapper?.offsetWidth || 0;
		svgHeight = backgroundWrapper?.offsetHeight || 0;
		backgroundOffsetX = ((svgWidth + radius) * (1 - scale)) / 2 + graphTranslation.x;
		backgroundOffsetY = ((svgHeight + radius) * (1 - scale)) / 2 + graphTranslation.y;
		gridOpacity = scale > opacityThreshold ? 1 : scale / opacityThreshold + minOpacity;
		majorGridOpacity =
			scale > opacityThreshold / 3 ? 1 : scale / (opacityThreshold / 3) + minOpacity;
	}
</script>

<!-- BACKGROUND COMPONENT START -->
<div
	id="background-wrapper"
	style:--calculated-background-color={bgColor}
	bind:this={backgroundWrapper}
>
	<svg>
		<defs>
			<pattern
				id="graph-pattern"
				x={backgroundOffsetX}
				y={backgroundOffsetY}
				width={gridScale}
				height={gridScale}
				patternUnits="userSpaceOnUse"
			>
				{#if style === 'dots'}
					<circle
						class="background-dot"
						style:--calculated-dot-color={dotColor}
						r={radius}
						cx={dotCenterCoordinate}
						cy={dotCenterCoordinate}
					/>
				{:else if style === 'lines'}
					<line
						class="background-line"
						style:--calculated-dot-color={dotColor}
						x1={dotCenterCoordinate}
						y1={0}
						x2={dotCenterCoordinate}
						y2={gridScale}
						stroke-width={radius}
					/>
					<line
						class="background-line"
						style:--calculated-dot-color={dotColor}
						y1={dotCenterCoordinate}
						x1={0}
						y2={dotCenterCoordinate}
						x2={gridScale}
						stroke-width={radius}
					/>
				{/if}
			</pattern>

			{#if majorGrid > 0}
				<pattern
					id="graph-coarse-pattern"
					x={backgroundOffsetX}
					y={backgroundOffsetY}
					width={gridScale * majorGrid}
					height={gridScale * majorGrid}
					patternUnits="userSpaceOnUse"
				>
					{#if style === 'dots'}
						<circle
							class="background-dot"
							style:--calculated-dot-color={dotColor}
							r={radius * 2}
							cx={dotCenterCoordinate}
							cy={dotCenterCoordinate}
						/>
					{:else if style === 'lines'}
						<line
							class="background-line"
							style:--calculated-dot-color={dotColor}
							x1={dotCenterCoordinate}
							y1={0}
							x2={dotCenterCoordinate}
							y2={gridScale * majorGrid}
							stroke-width={radius * 1.2}
						/>
						<line
							class="background-line"
							style:--calculated-dot-color={dotColor}
							y1={dotCenterCoordinate}
							x1={0}
							y2={dotCenterCoordinate}
							x2={gridScale * majorGrid}
							stroke-width={radius * 1.2}
						/>
					{/if}
				</pattern>
			{/if}
		</defs>
		<rect width="100%" height="100%" fill="url(#graph-pattern)" opacity={gridOpacity} />
		{#if majorGrid > 0}
			<rect
				width="100%"
				height="100%"
				fill="url(#graph-coarse-pattern)"
				opacity={majorGridOpacity}
			/>
		{/if}
	</svg>
</div>

<!-- BACKGROUND COMPONENT END -->

<!-- STYLES -->
<style>
	#background-wrapper {
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: -10;
		box-sizing: border-box;
		background-color: var(
			--calculated-background-color,
			var(--background-color, var(--default-background-color))
		);
	}

	.background-dot {
		fill: var(--calculated-dot-color, var(--dot-color, var(--default-dot-color)));
	}

	.background-line {
		stroke: var(--calculated-dot-color, var(--dot-color, var(--default-dot-color)));
	}

	svg {
		width: 100%;
		height: 100%;
	}
</style>
