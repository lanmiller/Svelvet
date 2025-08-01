<script context="module">
	import Graph from '../Graph/Graph.svelte';
	import FlowChart from '../../components/FlowChart/FlowChart.svelte';
	import { createEventDispatcher, onMount, setContext } from 'svelte';
	import { createGraph } from '../../utils';
	import { graphStore } from '../../stores';
	import { reloadStore } from '../../utils/savers/reloadStore';
	import { writable, get } from 'svelte/store';
	import { tick } from 'svelte';
	import Drawer from '../../components/Drawer/Drawer.svelte';
</script>

<script>
	export let mermaid = '';
	export let theme = 'light';
	export let id = 0;
	export let snapTo = 0;
	export let zoom = 1;
	export let TD = false;
	export let editable = true;
	export let locked = false;
	export let width = 0;
	export let height = 0;
	export let minimap = false;
	export let controls = false;
	export let toggle = false;
	export let drawer = false;
	export let contrast = false;
	export let fitView = false;
	export let selectionColor = 'lightblue';
	export let edgeStyle = 'bezier';
	export let endStyles = [null, null];
	export let edge = null;
	export let disableSelection = false;
	export let mermaidConfig = {};
	export let translation = { x: 0, y: 0 };
	export let trackpadPan = false;
	export let modifier = 'meta';
	export let raiseEdgesOnSelect = false;
	export let edgesAboveNode = false;
	export let title = '';
	export let fixedZoom = false;
	export let pannable = true;
	const dispatch = createEventDispatcher();
	const selectedEdgeStore = writable(null);
	export let graph = null;
	let direction = TD ? 'TD' : 'LR';
	let graphKey = `G-${id || Date.now()}`;
	graph = createGraph(graphKey, { zoom, direction, editable, locked, translation });
	graphStore.add(graph, graphKey);
	setContext('snapTo', snapTo);
	setContext('edgeStyle', edgeStyle);
	setContext('endStyles', endStyles);
	setContext('graphEdge', edge);
	setContext('raiseEdgesOnSelect', raiseEdgesOnSelect);
	setContext('edgesAboveNode', edgesAboveNode);
	setContext('graph', graph);
	setContext('selectedEdgeStore', selectedEdgeStore);
	function handleKeyDown(event) {
		if ((event.key === 'Delete' || event.key === 'Backspace') && graph) {
			const selectedEdgeId = $selectedEdgeStore;
			if (selectedEdgeId) {
				try {
					const allEdges = edgeStore.getAll();
					const targetEdge = allEdges.find((edge2) => edge2.id === selectedEdgeId);
					if (targetEdge) {
						const edgeKeys = edgeStore.match(targetEdge.source, targetEdge.target);
						if (edgeKeys.length > 0) {
							const deleted = edgeStore.delete(edgeKeys[0]);
							if (deleted) {
								selectedEdgeStore.set(null);
							}
						}
					}
				} catch (error) {}
			}
		}
		if (event.key === 'Escape') {
			selectedEdgeStore.set(null);
		}
	}
	function handleBackgroundClick(event) {
		const target = event.target;
		const isEdgeClick =
			target.closest('.edge-wrapper') ||
			target.closest('[data-edge-id]') ||
			target.tagName === 'path' ||
			target.classList.contains('edge-path') ||
			target.classList.contains('edge-click-area');
		const isNodeClick =
			target.closest('.svelvet-node') ||
			target.closest('[id^="N-"]') ||
			target.closest('.node-wrapper') ||
			target.closest('[data-node-id]');
		const isAnchorClick =
			target.closest('.anchor') || target.closest('[id^="A-"]') || target.closest('[data-anchor]');
		console.log(
			`\u{1F5B1}\uFE0F \u041A\u043B\u0438\u043A \u043D\u0430 \u0433\u0440\u0430\u0444\u0435:`,
			{
				target: target.tagName,
				className: target.className,
				isEdgeClick,
				isNodeClick,
				isAnchorClick
			}
		);
		if (!isEdgeClick && !isNodeClick && !isAnchorClick) {
			console.log(
				`\u{1F504} \u0421\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u0435\u043C \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F \u043F\u0440\u0438 \u043A\u043B\u0438\u043A\u0435 \u043D\u0430 \u0444\u043E\u043D`
			);
			selectedEdgeStore.set(null);
		}
	}
	onMount(() => {
		console.log('Graph component mounted with drawer:', drawer);
		const stateObject = localStorage.getItem('state');
		console.log('stateObject during onMount:', stateObject);
		if (stateObject && graph) {
			const reloadedGraph = reloadStore(stateObject);
			console.log('Este es el graph seteado mediante reloadStore(stateObject)', reloadedGraph);
			graph = reloadedGraph;
			graphStore.add(graph, graph.id);
			console.log('graphStore actualizado', graph);
		}
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});
	$: backgroundExists = $$slots.background;
	$: edgeStore = graph && graph.edges;
	$: if (graph) graph.transforms.scale.set(zoom);
	$: if (edgeStore) {
		edgeStore.onEdgeChange((edge2, type) => {
			dispatch(type, {
				sourceAnchor: edge2.source,
				targetAnchor: edge2.target,
				sourceNode: edge2.source.node,
				targetNode: edge2.target.node
			});
		});
	}
	export function disconnect(source, target) {
		const sourceNodeKey = `N-${source[0]}`;
		const sourceNode = graph.nodes.get(sourceNodeKey);
		if (!sourceNode) return;
		const sourceAnchor = sourceNode.anchors.get(`A-${source[1]}/N-${source[0]}`);
		if (!sourceAnchor) return;
		const targetNodeKey = `N-${target[0]}`;
		const targetNode = graph.nodes.get(targetNodeKey);
		if (!targetNode) return;
		const targetAnchor = targetNode.anchors.get(`A-${target[1]}/N-${target[0]}`);
		if (!targetAnchor) return;
		const edgeKey = graph.edges.match(sourceAnchor, targetAnchor);
		if (!edgeKey) return;
		graph.edges.delete(edgeKey[0]);
	}
</script>

<!-- Aqui se renderiza el grafico -->
{#if graph}
	<Graph
		{width}
		{height}
		{toggle}
		{backgroundExists}
		{minimap}
		{graph}
		{fitView}
		{fixedZoom}
		{pannable}
		{theme}
		{drawer}
		{controls}
		{selectionColor}
		{disableSelection}
		{trackpadPan}
		{modifier}
		{title}
		{contrast}
		on:edgeDrop
		on:click={handleBackgroundClick}
		on:nodeClicked={() => {
			console.log('🖱️ Клик по ноде - сбрасываем выделение соединения');
			selectedEdgeStore.set(null);
		}}
	>
		{#if mermaid.length}
			<FlowChart {mermaid} {mermaidConfig} />
		{/if}
		<slot />
		<slot name="minimap" slot="minimap" />
		<slot name="controls" slot="controls" />
		<slot name="background" slot="background" />
		<slot name="toggle" slot="toggle" />
		<slot name="drawer" slot="drawer" />
		<slot name="contrast" slot="contrast" />
	</Graph>
{:else}
	<div
		class="svelvet-temp"
		style:width={width ? width + 'px' : '100%'}
		style:height={height ? height + 'px' : '100%'}
	/>
{/if}

<style>
	.svelvet-temp {
		background-color: transparent;
	}
	:root {
		--default-node-border-width: 1.5px;
		--default-node-width: 200px;
		--default-node-height: 100px;
		--default-node-border-radius: 10px;

		--default-node-cursor: grab;
		--default-node-cursor-blocked: not-allowed;
		--default-background-cursor: move;

		--default-anchor-border-width: 1px;
		--default-anchor-radius: 50%;
		--default-anchor-size: 12px;

		--default-edge-width: 2px;

		--default-selection-box-border-width: 1px;

		--shadow-color: 0deg 0% 10%;
		--shadow-elevation-low: 0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.4),
			0.4px 0.8px 1px -1.2px hsl(var(--shadow-color) / 0.34),
			1px 2px 2.5px -2.5px hsl(var(--shadow-color) / 0.34);
		--shadow-elevation-medium: 0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.42),
			0.8px 1.6px 2px -0.8px hsl(var(--shadow-color) / 0.1),
			2.1px 4.1px 5.2px -1.7px hsl(var(--shadow-color) / 0.1),
			5px 10px 12.6px -2.5px hsl(var(--shadow-color) / 0.1);

		--default-controls-shadow: var(--shadow-elevation-medium);
		--default-minimap-shadow: var(--shadow-elevation-medium);
		--default-theme-toggle-shadow: var(--shadow-elevation-medium);
	}

	:root {
		--default-node-color: hsl(0, 0%, 95%);
		--default-node-border-color: hsl(0, 0%, 87%);
		--default-node-selection-color: hsl(0, 0%, 13%);
		--default-text-color: hsl(0, 0%, 20%);
		--default-node-shadow: var(--shadow-elevation-medium);

		--default-background-color: hsl(0, 0%, 100%);
		--default-dot-color: hsl(0, 0%, 53%);

		--default-accent-color: hsl(0, 0%, 100%);
		--default-primary-color: hsl(0, 0%, 83%);

		--default-selection-box-color: hsl(195, 53%, 79%);

		--default-edge-color: hsl(0, 0%, 40%);
		--default-target-edge-color: hsl(0, 0%, 0%);
		--default-edge-shadow: var(--shadow-elevation-medium);
		--default-label-color: hsl(0, 0%, 95%);
		--default-label-text-color: hsl(0, 0%, 20%);

		--plugin-border: hsl(0, 0%, 42%);
		--default-controls-border: var(--plugin-border);
		--default-minimap-border: var(--plugin-border);
		--default-theme-toggle-border: var(--plugin-border);

		--default-anchor-color: hsl(0, 0%, 67%);
		--default-anchor-border-color: hsl(0, 0%, 100%);

		--default-anchor-connected: hsl(0, 0%, 40%);
		--default-anchor-connected-border: hsl(0, 0%, 95%);

		--default-anchor-connecting: hsl(0, 0%, 40%);
		--default-anchor-connecting-border: hsl(0, 0%, 100%);

		--default-anchor-hovering: hsl(0, 0%, 46%);
		--default-anchor-hovering-border: hsl(0, 0%, 0%);

		--default-minimap-background-color: hsl(0, 0%, 100%);
		--default-minimap-node-color: hsl(0, 0%, 95%);

		--default-controls-background-color: hsl(0, 0%, 100%);
		--default-controls-text-color: hsl(0, 0%, 20%);

		--default-theme-toggle-text-color: hsl(0, 0%, 20%);
		--default-theme-toggle-color: hsl(0, 0%, 100%);

		--default-drawer-button-color: hsl(0, 2%, 89%);
		--default-drawer-button-text-color: hsl(0, 0%, 20%);

		--default-drawer-reset-button-color: hsl(0, 2%, 89%);
		--default-drawer-reset-button-text-color: hsl(0, 0%, 20%);
		--default-drawer-reset-button-hover-color: hsl(0, 0%, 30%);
		--default-drawer-reset-button-hover-text-color: hsl(0, 0%, 100%);
	}

	:root[svelvet-theme='dark'] {
		--default-node-color: hsl(0, 0%, 20%);
		--default-node-border-color: hsl(0, 0%, 7%);
		--default-node-selection-color: hsl(0, 0%, 87%);
		--default-text-color: hsl(0, 0%, 100%);
		--default-node-shadow: var(--shadow-elevation-medium);

		--default-background-color: hsl(0, 0%, 27%);
		--default-dot-color: hsl(0, 0%, 60%);

		--default-accent-color: hsl(0, 0%, 7%);
		--default-primary-color: hsl(0, 0%, 66%);

		--default-selection-box-color: hsl(195, 53%, 79%);

		--default-edge-color: hsl(0, 0%, 100%);
		--default-target-edge-color: hsl(0, 0%, 0%);
		--default-edge-shadow: var(--shadow-elevation-medium);
		--default-label-color: hsl(0, 0%, 20%);
		--default-label-text-color: hsl(0, 0%, 100%);

		--default-anchor-color: hsl(0, 0%, 67%);
		--default-anchor-border-color: hsl(0, 0%, 87%);
		--default-anchor-connected: hsl(0, 0%, 100%);
		--default-anchor-connected-border: hsl(0, 0%, 20%);

		--default-anchor-connecting: hsl(0, 0%, 40%);
		--default-anchor-connecting-border: hsl(0, 0%, 100%);

		--default-anchor-hovering: hsl(0, 0%, 46%);
		--default-anchor-hovering-border: hsl(0, 0%, 0%);

		--plugin-border: hsl(0, 0%, 42%);
		--default-controls-border: var(--plugin-border);
		--default-minimap-border: var(--plugin-border);
		--default-theme-toggle-border: var(--plugin-border);

		--default-minimap-background-color: hsl(0, 0%, 27%);

		--default-minimap-node-color: hsl(0, 0%, 20%);

		--default-controls-background-color: hsl(0, 0%, 27%);
		--default-controls-text-color: hsl(0, 0%, 100%);

		--default-theme-toggle-text-color: hsl(0, 0%, 100%);
		--default-theme-toggle-color: hsl(0, 0%, 27%);

		--default-drawer-button-color: hsl(0, 0%, 19%);
		--default-drawer-button-text-color: hsl(0, 0%, 100%);

		--default-drawer-reset-button-color: hsl(0, 0%, 19%);
		--default-drawer-reset-button-text-color: hsl(0, 0%, 89%);
		--default-drawer-reset-button-hover-color: hsl(0, 0%, 59%);
		--default-drawer-reset-button-hover-text-color: hsl(0, 0%, 100%);
	}

	:root[svelvet-theme='light'] {
		--default-node-color: hsl(0, 0%, 95%);
		--default-node-border-color: hsl(0, 0%, 87%);
		--default-node-selection-color: hsl(0, 0%, 13%);
		--default-text-color: hsl(0, 0%, 20%);
		--default-node-shadow: var(--shadow-elevation-medium);

		--default-background-color: hsl(0, 0%, 100%);
		--default-dot-color: hsl(0, 0%, 53%);

		--default-accent-color: hsl(0, 0%, 100%);
		--default-primary-color: hsl(0, 0%, 83%);

		--default-selection-box-color: hsl(195, 53%, 79%);

		--default-edge-color: hsl(0, 0%, 40%);
		--default-target-edge-color: hsl(0, 0%, 0%);
		--default-edge-shadow: var(--shadow-elevation-medium);
		--default-label-color: hsl(0, 0%, 95%);
		--default-label-text-color: hsl(0, 0%, 20%);

		--plugin-border: hsl(0, 0%, 42%);
		--default-controls-border: var(--plugin-border);
		--default-minimap-border: var(--plugin-border);
		--default-theme-toggle-border: var(--plugin-border);

		--default-anchor-color: hsl(0, 0%, 67%);
		--default-anchor-border-color: hsl(0, 0%, 100%);

		--default-anchor-connected: hsl(0, 0%, 40%);
		--default-anchor-connected-border: hsl(0, 0%, 95%);

		--default-anchor-connecting: hsl(0, 0%, 40%);
		--default-anchor-connecting-border: hsl(0, 0%, 100%);

		--default-anchor-hovering: hsl(0, 0%, 46%);
		--default-anchor-hovering-border: hsl(0, 0%, 0%);

		--default-minimap-background-color: hsl(0, 0%, 100%);
		--default-minimap-node-color: hsl(0, 0%, 95%);

		--default-controls-background-color: hsl(0, 0%, 100%);
		--default-controls-text-color: hsl(0, 0%, 20%);

		--default-theme-toggle-text-color: hsl(0, 0%, 20%);
		--default-theme-toggle-color: hsl(0, 0%, 100%);

		--default-drawer-button-color: hsl(0, 2%, 89%);
		--default-drawer-button-text-color: hsl(0, 0%, 20%);

		--default-drawer-reset-button-color: hsl(0, 2%, 89%);
		--default-drawer-reset-button-text-color: hsl(0, 0%, 20%);
		--default-drawer-reset-button-hover-color: hsl(0, 0%, 30%);
		--default-drawer-reset-button-hover-text-color: hsl(0, 0%, 100%);
	}
	:root[svelvet-theme='Black/White'] {
		--default-node-color: #ffffff;
		--default-node-border-color: #ffffff;
		--default-node-selection-color: #000000;
		--default-text-color: #000000;
		--default-node-shadow: var(--shadow-elevation-medium);

		--default-background-color: #000000;
		--default-dot-color: #ffffff;

		--default-accent-color: #000000;
		--default-primary-color: #ffffff;

		--default-selection-box-color: #ffffff;

		--default-edge-color: #ffffff;
		--default-target-edge-color: #000000;
		--default-edge-shadow: var(--shadow-elevation-medium);
		--default-label-color: #ffffff;
		--default-label-text-color: #000000;

		--plugin-border: #ffffff;
		--default-controls-border: var(--plugin-border);
		--default-minimap-border: var(--plugin-border);
		--default-theme-toggle-border: var(--plugin-border);

		--default-anchor-color: #ffffff;
		--default-anchor-border-color: #000000;

		--default-anchor-connected: #ffffff;
		--default-anchor-connected-border: #000000;

		--default-anchor-connecting: #ffffff;
		--default-anchor-connecting-border: #000000;

		--default-anchor-hovering: #ffffff;
		--default-anchor-hovering-border: #000000;

		--default-minimap-background-color: #000000;
		--default-minimap-node-color: #ffffff;

		--default-controls-background-color: #000000;
		--default-controls-text-color: #ffffff;

		--default-theme-toggle-text-color: #ffffff;
		--default-theme-toggle-color: #000000;

		--default-drawer-button-color: #ffffff;
		--default-drawer-button-text-color: #000000;

		--default-drawer-reset-button-color: #ffffff;
		--default-drawer-reset-button-text-color: #000000;
		--default-drawer-reset-button-hover-color: #e0e0e0;
		--default-drawer-reset-button-hover-text-color: #000000;
	}

	:root[svelvet-theme='Yellow/Black'] {
		--default-node-color: #ffff00;
		--default-node-border-color: #000000;
		--default-node-selection-color: #000000;
		--default-text-color: #000000;
		--default-node-shadow: var(--shadow-elevation-medium);

		--default-background-color: #ffff00;
		--default-dot-color: #000000;

		--default-accent-color: #000000;
		--default-primary-color: #ffff00;

		--default-selection-box-color: #000000;

		--default-edge-color: #000000;
		--default-target-edge-color: #ffff00;
		--default-edge-shadow: var(--shadow-elevation-medium);
		--default-label-color: #000000;
		--default-label-text-color: #ffff00;

		--plugin-border: #000000;
		--default-controls-border: var(--plugin-border);
		--default-minimap-border: var(--plugin-border);
		--default-theme-toggle-border: var(--plugin-border);

		--default-anchor-color: #ffff00;
		--default-anchor-border-color: #000000;

		--default-anchor-connected: #ffff00;
		--default-anchor-connected-border: #000000;

		--default-anchor-connecting: #ffff00;
		--default-anchor-connecting-border: #000000;

		--default-anchor-hovering: #ffff00;
		--default-anchor-hovering-border: #000000;

		--default-minimap-background-color: #ffff00;
		--default-minimap-node-color: #000000;

		--default-controls-background-color: #ffff00;
		--default-controls-text-color: #000000;

		--default-theme-toggle-text-color: #000000;
		--default-theme-toggle-color: #ffff00;

		--default-drawer-button-color: #ffff00;
		--default-drawer-button-text-color: #000000;

		--default-drawer-reset-button-color: #ffff00;
		--default-drawer-reset-button-text-color: #000000;
		--default-drawer-reset-button-hover-color: #000000;
		--default-drawer-reset-button-hover-text-color: #ffff00;
	}

	:root[svelvet-theme='Black/Yellow'] {
		--default-node-color: #000000;
		--default-node-border-color: #ffff00;
		--default-node-selection-color: #ffff00;
		--default-text-color: #ffff00;
		--default-node-shadow: var(--shadow-elevation-medium);

		--default-background-color: #000000;
		--default-dot-color: #ffff00;

		--default-accent-color: #ffff00;
		--default-primary-color: #000000;

		--default-selection-box-color: #ffff00;

		--default-edge-color: #ffff00;
		--default-target-edge-color: #000000;
		--default-edge-shadow: var(--shadow-elevation-medium);
		--default-label-color: #ffff00;
		--default-label-text-color: #000000;

		--plugin-border: #ffff00;
		--default-controls-border: var(--plugin-border);
		--default-minimap-border: var(--plugin-border);
		--default-theme-toggle-border: var(--plugin-border);

		--default-anchor-color: #ffff00;
		--default-anchor-border-color: #000000;

		--default-anchor-connected: #ffff00;
		--default-anchor-connected-border: #000000;

		--default-anchor-connecting: #ffff00;
		--default-anchor-connecting-border: #000000;

		--default-anchor-hovering: #ffff00;
		--default-anchor-hovering-border: #000000;

		--default-minimap-background-color: #000000;
		--default-minimap-node-color: #ffff00;

		--default-controls-background-color: #000000;
		--default-controls-text-color: #ffff00;

		--default-theme-toggle-text-color: #ffff00;
		--default-theme-toggle-color: #000000;

		--default-drawer-button-color: #000000;
		--default-drawer-button-text-color: #ffff00;

		--default-drawer-reset-button-color: #000000;
		--default-drawer-reset-button-text-color: #ffff00;
		--default-drawer-reset-button-hover-color: #ffff00;
		--default-drawer-reset-button-hover-text-color: #000000;
	}

	:root[svelvet-theme='Black/Green'] {
		--default-node-color: #000000;
		--default-node-border-color: #00ff00;
		--default-node-selection-color: #00ff00;
		--default-text-color: #00ff00;
		--default-node-shadow: var(--shadow-elevation-medium);

		--default-background-color: #000000;
		--default-dot-color: #00ff00;

		--default-accent-color: #00ff00;
		--default-primary-color: #000000;

		--default-selection-box-color: #00ff00;

		--default-edge-color: #00ff00;
		--default-target-edge-color: #000000;
		--default-edge-shadow: var(--shadow-elevation-medium);
		--default-label-color: #00ff00;
		--default-label-text-color: #000000;

		--plugin-border: #00ff00;
		--default-controls-border: var(--plugin-border);
		--default-minimap-border: var(--plugin-border);
		--default-theme-toggle-border: var(--plugin-border);

		--default-anchor-color: #00ff00;
		--default-anchor-border-color: #000000;

		--default-anchor-connected: #00ff00;
		--default-anchor-connected-border: #000000;

		--default-anchor-connecting: #00ff00;
		--default-anchor-connecting-border: #000000;

		--default-anchor-hovering: #00ff00;
		--default-anchor-hovering-border: #000000;

		--default-minimap-background-color: #000000;
		--default-minimap-node-color: #00ff00;

		--default-controls-background-color: #000000;
		--default-controls-text-color: #00ff00;

		--default-theme-toggle-text-color: #00ff00;
		--default-theme-toggle-color: #000000;

		--default-drawer-button-color: #000000;
		--default-drawer-button-text-color: #00ff00;

		--default-drawer-reset-button-color: #000000;
		--default-drawer-reset-button-text-color: #00ff00;
		--default-drawer-reset-button-hover-color: #00ff00;
		--default-drawer-reset-button-hover-text-color: #000000;
	}

	:root[svelvet-theme='Blue/Yellow'] {
		--default-node-color: #0000ff;
		--default-node-border-color: #ffff00;
		--default-node-selection-color: #ffff00;
		--default-text-color: #ffff00;
		--default-node-shadow: var(--shadow-elevation-medium);

		--default-background-color: #0000ff;
		--default-dot-color: #ffff00;

		--default-accent-color: #ffff00;
		--default-primary-color: #0000ff;

		--default-selection-box-color: #ffff00;

		--default-edge-color: #ffff00;
		--default-target-edge-color: #0000ff;
		--default-edge-shadow: var(--shadow-elevation-medium);
		--default-label-color: #ffff00;
		--default-label-text-color: #0000ff;

		--plugin-border: #ffff00;
		--default-controls-border: var(--plugin-border);
		--default-minimap-border: var(--plugin-border);
		--default-theme-toggle-border: var(--plugin-border);

		--default-anchor-color: #ffff00;
		--default-anchor-border-color: #0000ff;

		--default-anchor-connected: #ffff00;
		--default-anchor-connected-border: #0000ff;

		--default-anchor-connecting: #ffff00;
		--default-anchor-connecting-border: #0000ff;

		--default-anchor-hovering: #ffff00;
		--default-anchor-hovering-border: #0000ff;

		--default-minimap-background-color: #0000ff;
		--default-minimap-node-color: #ffff00;

		--default-controls-background-color: #0000ff;
		--default-controls-text-color: #ffff00;

		--default-theme-toggle-text-color: #ffff00;
		--default-theme-toggle-color: #0000ff;

		--default-drawer-button-color: #0000ff;
		--default-drawer-button-text-color: #ffff00;

		--default-drawer-reset-button-color: #0000ff;
		--default-drawer-reset-button-text-color: #ffff00;
		--default-drawer-reset-button-hover-color: #ffff00;
		--default-drawer-reset-button-hover-text-color: #0000ff;
	}

	:root[svelvet-theme='Yellow/Blue'] {
		--default-node-color: #ffff00;
		--default-node-border-color: #0000ff;
		--default-node-selection-color: #0000ff;
		--default-text-color: #0000ff;
		--default-node-shadow: var(--shadow-elevation-medium);

		--default-background-color: #ffff00;
		--default-dot-color: #0000ff;

		--default-accent-color: #0000ff;
		--default-primary-color: #ffff00;

		--default-selection-box-color: #0000ff;

		--default-edge-color: #0000ff;
		--default-target-edge-color: #ffff00;
		--default-edge-shadow: var(--shadow-elevation-medium);
		--default-label-color: #0000ff;
		--default-label-text-color: #ffff00;

		--plugin-border: #0000ff;
		--default-controls-border: var(--plugin-border);
		--default-minimap-border: var(--plugin-border);
		--default-theme-toggle-border: var(--plugin-border);

		--default-anchor-color: #0000ff;
		--default-anchor-border-color: #ffff00;

		--default-anchor-connected: #0000ff;
		--default-anchor-connected-border: #ffff00;

		--default-anchor-connecting: #0000ff;
		--default-anchor-connecting-border: #ffff00;

		--default-anchor-hovering: #0000ff;
		--default-anchor-hovering-border: #ffff00;

		--default-minimap-background-color: #ffff00;
		--default-minimap-node-color: #0000ff;

		--default-controls-background-color: #ffff00;
		--default-controls-text-color: #0000ff;

		--default-theme-toggle-text-color: #0000ff;
		--default-theme-toggle-color: #ffff00;

		--default-drawer-button-color: #ffff00;
		--default-drawer-button-text-color: #0000ff;

		--default-drawer-reset-button-color: #ffff00;
		--default-drawer-reset-button-text-color: #0000ff;
		--default-drawer-reset-button-hover-color: #0000ff;
		--default-drawer-reset-button-hover-text-color: #ffff00;
	}

	:root[svelvet-theme='Grayscale'] {
		--default-node-color: #666666;
		--default-node-border-color: #f2f2f2;
		--default-node-selection-color: #333333;
		--default-text-color: #f2f2f2;
		--default-node-shadow: var(--shadow-elevation-medium);

		--default-background-color: #333333;
		--default-dot-color: #999999;

		--default-accent-color: #333333;
		--default-primary-color: #999999;

		--default-selection-box-color: #f2f2f2;

		--default-edge-color: #999999;
		--default-target-edge-color: #666666;
		--default-edge-shadow: var(--shadow-elevation-medium);
		--default-label-color: #666666;
		--default-label-text-color: #f2f2f2;

		--plugin-border: #999999;
		--default-controls-border: var(--plugin-border);
		--default-minimap-border: var(--plugin-border);
		--default-theme-toggle-border: var(--plugin-border);

		--default-anchor-color: #999999;
		--default-anchor-border-color: #666666;

		--default-anchor-connected: #999999;
		--default-anchor-connected-border: #666666;

		--default-anchor-connecting: #999999;
		--default-anchor-connecting-border: #f2f2f2;

		--default-anchor-hovering: #999999;
		--default-anchor-hovering-border: #f2f2f2;

		--default-minimap-background-color: #333333;
		--default-minimap-node-color: #666666;

		--default-controls-background-color: #333333;
		--default-controls-text-color: #f2f2f2;

		--default-theme-toggle-text-color: #f2f2f2;
		--default-theme-toggle-color: #333333;

		--default-drawer-button-color: #999999;
		--default-drawer-button-text-color: #f2f2f2;

		--default-drawer-reset-button-color: #999999;
		--default-drawer-reset-button-text-color: #f2f2f2;
		--default-drawer-reset-button-hover-color: #f2f2f2;
		--default-drawer-reset-button-hover-text-color: #333333;
	}

	:root[svelvet-theme='Black/Pink'] {
		--default-node-color: #000000;
		--default-node-border-color: #ff69b4;
		--default-node-selection-color: #333333;
		--default-text-color: #ff69b4;
		--default-node-shadow: var(--shadow-elevation-medium);

		--default-background-color: #000000;
		--default-dot-color: #ff69b4;

		--default-accent-color: #333333;
		--default-primary-color: #ff69b4;

		--default-selection-box-color: #ff69b4;

		--default-edge-color: #ff69b4;
		--default-target-edge-color: #000000;
		--default-edge-shadow: var(--shadow-elevation-medium);
		--default-label-color: #000000;
		--default-label-text-color: #ff69b4;

		--plugin-border: #ff69b4;
		--default-controls-border: var(--plugin-border);
		--default-minimap-border: var(--plugin-border);
		--default-theme-toggle-border: var(--plugin-border);

		--default-anchor-color: #ff69b4;
		--default-anchor-border-color: #000000;

		--default-anchor-connected: #ff69b4;
		--default-anchor-connected-border: #000000;

		--default-anchor-connecting: #ff69b4;
		--default-anchor-connecting-border: #333333;

		--default-anchor-hovering: #ff69b4;
		--default-anchor-hovering-border: #333333;

		--default-minimap-background-color: #000000;
		--default-minimap-node-color: #333333;

		--default-controls-background-color: #000000;
		--default-controls-text-color: #ff69b4;

		--default-theme-toggle-text-color: #ff69b4;
		--default-theme-toggle-color: #000000;

		--default-drawer-button-color: #ff69b4;
		--default-drawer-button-text-color: #000000;

		--default-drawer-reset-button-color: #ff69b4;
		--default-drawer-reset-button-text-color: #000000;
		--default-drawer-reset-button-hover-color: #000000;
		--default-drawer-reset-button-hover-text-color: #ff69b4;
	}
</style>
