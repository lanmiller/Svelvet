<script context="module" lang="ts">
	import SelectionBox from '$lib/components/SelectionBox/SelectionBox.svelte';
	import Background from '../Background/Background.svelte';
	import GraphRenderer from '../../renderers/GraphRenderer/GraphRenderer.svelte';
	import Editor from '$lib/components/Editor/Editor.svelte';
	import { connectingFrom } from '$lib/components/Anchor/Anchor.svelte';
	import { onMount, setContext, createEventDispatcher, tick } from 'svelte';
	import { isArrow } from '$lib/types';
	import { moveElementWithBounds, calculateRelativeBounds } from '$lib/utils/movers';
	import { touchDistance, initialClickPosition, tracking } from '$lib/stores/CursorStore';
	import { calculateFitView, calculateTranslation, calculateZoom, generateKey } from '$lib/utils';
	import { get, writable, readable } from 'svelte/store';
	import { getRandomColor } from '$lib/utils';
	import { moveElement, zoomAndTranslate } from '$lib/utils/movers';
	import type { Writable } from 'svelte/store';
	import type { ComponentType } from 'svelte';
	import type { Graph, GroupBox, GraphDimensions, CSSColorString } from '$lib/types';
	import type { Arrow, GroupKey, Group, CursorAnchor, ActiveIntervals } from '$lib/types';
	import { getSnappedPosition } from '$lib/utils/snapGrid';
</script>

<script lang="ts">
	// defining props that the Graph component expects when it is used, type annotations added
	export let graph: Graph;
	export let width: number;
	export let height: number;
	export let minimap = false;
	export let controls = false;
	export let toggle = false;
	export let fixedZoom = false;
	export let pannable = true;
	export let disableSelection = false;
	export let ZOOM_INCREMENT = 0.1;
	export let PAN_INCREMENT = 50;
	export let PAN_TIME = 250;
	export let MAX_SCALE = 3;
	export let MIN_SCALE = 0.2;
	export let selectionColor: CSSColorString;
	export let backgroundExists: boolean;
	export let fitView: boolean | 'resize' = false;
	export let trackpadPan: boolean;
	export let modifier: 'alt' | 'ctrl' | 'shift' | 'meta';
	export let theme = 'light';
	export let title: string;
	export let drawer = false;
	export let contrast = false;

	// Log drawer prop initially
	console.log('Initial Graph drawer prop:', drawer);

	let animationFrameId: number;

	// creates a dispatch function using Svelte's createEventDispatcher. This function is used to dispatch custom events from the component. For example, if the component needs to notify parent components of certain actions or changes, dispatch can be used to emit these events.
	const dispatch = createEventDispatcher();
	// declares a variable activeIntervals with an initial empty object. This is likely used to keep track of active intervals (created with setInterval) that might be used in the component, allowing for better management and clearance of these intervals.
	const activeIntervals: ActiveIntervals = {};

	// creates a Svelte writable store named duplicate. This store probably holds a boolean value to track whether some duplication functionality is active or not.
	const duplicate = writable(false);
	// another writable store, which seems to be used to track if the component has mounted or to count certain actions after mounting.
	const mounted = writable(0);
	// is a writable store to hold a reference to the graph's DOM element. This is useful for direct DOM manipulations or access.
	const graphDOMElement: Writable<HTMLElement | null> = writable(null);

	// External stores
	// These are Svelte stores that are likely passed as part of the graph prop or accessed directly from it. They represent various aspects of the graph's state, such as its current cursor position, scale, dimensions, and more
	const cursor = graph.cursor;
	const scale = graph.transforms.scale;
	const dimensionsStore = graph.dimensions;
	const translation = graph.transforms.translation;
	const groups = graph.groups;
	const groupBoxes = graph.groupBoxes;
	const selected = $groups.selected.nodes;
	const activeGroup = graph.activeGroup;
	const initialNodePositions = graph.initialNodePositions;
	const editing = graph.editing;
	const nodeBounds = graph.bounds.nodeBounds;

	// Reactive variables
	// These are standard JavaScript variables that are reactive, meaning Svelte will re-run any reactive statements or parts of the DOM that depend on these variables whenever their values change.
	let initialDistance = 0;
	let initialScale = 1;
	let anchor = { x: 0, y: 0, top: 0, left: 0 };
	let selecting = false;
	let creating = false;
	let adding = false;
	let isMovable = false;
	let pinching = false;
	let initialFit = false;
	let graphDimensions: GraphDimensions;
	let toggleComponent: ComponentType | null = null;
	let minimapComponent: ComponentType | null = null;
	let controlsComponent: ComponentType | null = null;
	let drawerComponent: ComponentType | null = null;
	let contrastComponent: ComponentType | null = null;
	let spacePressed = false; // For Figma-like space panning

	// Subscriptions
	// This line is a Svelte reactive statement, denoted by $:. It creates a reactivity relationship between dimensions and dimensionsStore.
	$: dimensions = $dimensionsStore;

	// Update the svelvet-theme attribute everytime the theme changes
	$: if (theme && typeof document !== 'undefined')
		document.documentElement.setAttribute('svelvet-theme', theme);
	// camera view adjustment
	$: if (!initialFit && fitView) {
		fitIntoView();
	}
	// load the theme toggle
	$: if (toggle && !toggleComponent) loadToggle();
	// load the minimap
	$: if (minimap && !minimapComponent) loadMinimap();
	// load the controls interface
	$: if (controls && !controlsComponent) loadControls();
	// load the drawer
	$: if (drawer && !drawerComponent) loadDrawer();
	//load the contrast options
	$: if (contrast && !contrastComponent) loadContrast();

	// Log drawer prop when it changes
	$: console.log('Reactive Graph drawer prop:', drawer);

	// This is a temporary workaround for generating an edge where one of the anchors is the cursor
	const cursorAnchor: CursorAnchor = {
		id: null,
		position: graph.cursor,
		offset: writable({ x: 0, y: 0 }),
		connected: writable(new Set()),
		dynamic: writable(false),
		edge: null,
		edgeColor: writable(null),
		direction: writable('self'),
		inputKey: null,
		type: 'output',
		moving: readable(false),
		store: null,
		mounted: writable(true),
		rotation: readable(0),
		node: {
			zIndex: writable(Infinity),
			rotating: writable(false),
			position: graph.cursor,
			dimensions: { width: writable(0), height: writable(0) }
		}
	};

	// This is an experiment to see if there's a benefit
	// to selectively splitting up the contexts into smaller pieces
	setContext('graphDOMElement', graphDOMElement);
	setContext('cursorAnchor', cursorAnchor);
	setContext('duplicate', duplicate);
	setContext('graph', graph);
	setContext('transforms', graph.transforms);
	setContext('dimensions', graph.dimensions);
	setContext('locked', graph.locked);
	setContext('groups', graph.groups);
	setContext('bounds', graph.bounds);
	setContext('edgeStore', graph.edges);
	setContext('nodeStore', graph.nodes);
	setContext('mounted', mounted);

	// Lifecycle methods
	onMount(() => {
		console.log('Graph component mounted with drawer1:', drawer); // Add this line
		updateGraphDimensions();

		// Reset space key on window blur
		const handleWindowBlur = () => {
			spacePressed = false;
		};
		window.addEventListener('blur', handleWindowBlur);

		return () => {
			window.removeEventListener('blur', handleWindowBlur);
		};
	});

	async function fitIntoView() {
		await tick();
		tracking.set(true);
		const { x, y, scale } = calculateFitView(graphDimensions, $nodeBounds);
		if (x !== null && y !== null && scale !== null) {
			graph.transforms.scale.set(scale);
			translation.set({ x, y });
		}
		tracking.set(false);
		initialFit = true;
	}
	async function loadMinimap() {
		minimapComponent = (await import('$lib/components/Minimap/Minimap.svelte')).default;
	}

	async function loadToggle() {
		toggleComponent = (await import('$lib/components/ThemeToggle/ThemeToggle.svelte')).default;
	}

	async function loadControls() {
		controlsComponent = (await import('$lib/components/Controls/Controls.svelte')).default;
	}

	async function loadDrawer() {
		drawerComponent = (await import('$lib/components/Drawer/DrawerController.svelte')).default;
	}

	async function loadContrast() {
		contrastComponent = (await import('$lib/components/ContrastTheme/ContrastTheme.svelte'))
			.default;
	}

	function updateGraphDimensions() {
		if (!$graphDOMElement) return;
		const DOMRect = $graphDOMElement.getBoundingClientRect();
		graphDimensions = {
			top: DOMRect.top,
			left: DOMRect.left,
			bottom: DOMRect.bottom,
			right: DOMRect.right,
			width: DOMRect.width,
			height: DOMRect.height
		};

		graph.dimensions.set(graphDimensions);
		if (fitView === 'resize') fitIntoView();
	}

	function onMouseUp(e: MouseEvent | TouchEvent) {
		if (creating) {
			const groupName = generateKey();
			const groupKey: GroupKey = `${groupName}/${graph.id}`;
			const cursorPosition = get(cursor);
			const width = cursorPosition.x - $initialClickPosition.x;
			const height = cursorPosition.y - $initialClickPosition.y;
			const top = Math.min($initialClickPosition.y, $initialClickPosition.y + height);
			const left = Math.min($initialClickPosition.x, $initialClickPosition.x + width);

			const dimensions = {
				width: writable(Math.abs(width)),
				height: writable(Math.abs(height))
			};
			const position = writable({
				x: left,
				y: top
			});

			const groupBox: GroupBox = {
				group: writable(groupKey),
				dimensions,
				position,
				color: writable(getRandomColor()),
				moving: writable(false)
			};

			groupBoxes.add(groupBox, groupKey);

			Array.from($selected).forEach((node) => {
				node.group.set(groupKey);
			});

			groups.update((groups) => {
				const newGroup: Group = {
					parent: writable(groupBox),
					nodes: writable(new Set([...$selected, groupBox]))
				};
				groups[groupKey] = newGroup;
				return groups;
			});

			$selected = new Set();

			creating = false;
			selecting = false;
		}

		// Set moving boolean on active group to false
		if ($activeGroup) {
			const nodeGroupArray = Array.from(get($groups[$activeGroup].nodes));
			nodeGroupArray.forEach((node) => {
				const snappedPos = getSnappedPosition(get(node.position).x, get(node.position).y);
				node.position.set(snappedPos);
				node.moving.set(false);
			});
		}

		const cursorEdge = graph.edges.get('cursor');
		if (cursorEdge) {
			graph.edges.delete('cursor');
			if (!cursorEdge.disconnect) {
				dispatch('edgeDrop', {
					cursor: get(cursor),
					source: {
						node: $connectingFrom?.anchor.node.id.slice(2),
						anchor: $connectingFrom?.anchor.id.split('/')[0].slice(2)
					}
				});
			}
		}

		$activeGroup = null;
		$initialClickPosition = { x: 0, y: 0 };
		$initialNodePositions = [];
		selecting = false;
		isMovable = false;
		$tracking = false;

		if (!e.shiftKey) {
			connectingFrom.set(null);
		}

		anchor.y = 0;
		anchor.x = 0;
	}

	function onMouseDown(e: MouseEvent) {
		// Allow panning if space is pressed (Figma-like behavior)
		if (!pannable && !spacePressed && !(e.shiftKey || e.metaKey)) return;
		if (e.button === 2) return;
		if ($graphDOMElement) $graphDOMElement.focus();

		const { clientX, clientY } = e;

		$initialClickPosition = get(cursor);

		// If space is pressed, enable panning mode
		if (spacePressed) {
			isMovable = true;
			return;
		}

		if (e.shiftKey || e.metaKey) {
			e.preventDefault();
			selecting = true;
			const { top, left } = dimensions;
			anchor.y = clientY - top;
			anchor.x = clientX - left;
			anchor.top = top;
			anchor.left = left;
			if (e.shiftKey && e.metaKey) {
				creating = true;
			} else {
				creating = false;
			}

			if (e.metaKey && !e.shiftKey) {
				adding = true;
			} else {
				adding = false;
			}
		} else {
			isMovable = true;
			$selected = new Set();
			$selected = $selected;
		}
	}

	function onTouchStart(e: TouchEvent) {
		$selected = new Set();
		$selected = $selected;

		$initialClickPosition = get(cursor);

		isMovable = true;
		if (e.touches.length === 2) {
			startPinching();
			initialDistance = $touchDistance;
			initialScale = $scale;
		}
	}

	function onTouchEnd() {
		isMovable = false;
		pinching = false;
	}

	function startPinching() {
		if (!pinching) {
			pinching = true;
			animationFrameId = requestAnimationFrame(handlePinch);
		}
	}

	function handlePinch() {
		if (!pinching) {
			cancelAnimationFrame(animationFrameId);
			return;
		}

		const newDistance = $touchDistance;
		const scaleFactor = newDistance / initialDistance;
		$scale = initialScale * scaleFactor;
		animationFrameId = requestAnimationFrame(handlePinch);
	}

	function handleKeyDown(e: KeyboardEvent) {
		const { key, code } = e;
		const target = e.target as HTMLElement;

		// We dont want to prevent users from interacting with inputs
		if (target.tagName == 'INPUT' || target.tagName == 'TEXTAREA') return;

		// Handle space for panning (Figma-like behavior)
		if (key === ' ' || code === 'Space') {
			e.preventDefault(); // Prevent page scroll
			spacePressed = true;
			return;
		}

		if (code === 'KeyA' && e[`${modifier}Key`]) {
			const unlockedNodes = graph.nodes.getAll().filter((node) => !get(node.locked));
			$selected = new Set(unlockedNodes);
		} else if (isArrow(key)) {
			handleArrowKey(key as Arrow, e);
		} else if (key === '=') {
			zoomAndTranslate(-1, graph.dimensions, graph.transforms, ZOOM_INCREMENT);
		} else if (key === '-') {
			zoomAndTranslate(1, graph.dimensions, graph.transforms, ZOOM_INCREMENT);
		} else if (key === '0') {
			fitIntoView();
		} else if (key === 'Control') {
			$groups['selected'].nodes.set(new Set());
		} else if (code === 'KeyD' && e[`${modifier}Key`]) {
			duplicate.set(true);
			setTimeout(() => {
				duplicate.set(false);
			}, 100);
		} else if (key === 'Tab' && (e.altKey || e.ctrlKey)) {
			selectNextNode();
		} else if (key === 'l') {
			theme = theme === 'light' ? 'dark' : 'light';
		} else if (key === 'd') {
			drawer = !drawer;
		} else if (key === 'm') {
			minimap = !minimap;
		} else if (key === 'c') {
			controls = !controls;
		} else if (key === 'e') {
			const node = Array.from($selected)[0];
			graph.editing.set(node);
		} else {
			return; // Unhandled action: used default handler
		}

		e.preventDefault();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();

		// Get the mouse position relative to the graph's DOM element
		const graphRect = $graphDOMElement?.getBoundingClientRect();
		if (!graphRect) return;

		const mouseX = e.clientX - graphRect.left;
		const mouseY = e.clientY - graphRect.top;

		// Snap the position to the nearest grid point
		const { x: snappedX, y: snappedY } = getSnappedPosition(mouseX, mouseY);
		console.log(`Dropped Node at Snapped Position: (${snappedX}, ${snappedY})`);

		// Ensure that a node type is being dragged
		if (!draggedNodeType) return;

		// Create a new node with the snapped position
		const newNode = {
			id: `node-${Date.now()}`, // Unique ID based on timestamp
			rotation: writable(0), // Rotation angle
			position: writable({ x: snappedX, y: snappedY }), // Position as a writable store
			moving: writable(false), // Initial moving state
			label: writable('New Node'), // Default label
			dimensions: {
				width: writable(200), // Default width as a writable store
				height: writable(100) // Default height as a writable store
			},
			inputs: writable(2), // Default number of input anchors
			outputs: writable(2), // Default number of output anchors
			anchors: writable([]), // Empty anchors array (you may want to define this more specifically)
			group: writable(null), // Initially no group
			collapsed: writable(false), // Default collapsed state
			resizingWidth: writable(false), // Default resizing width state
			resizingHeight: writable(false), // Default resizing height state
			rotating: writable(false), // Default rotating state
			editable: writable(true), // Node is editable by default
			locked: writable(false), // Node is not locked by default
			recalculateAnchors: (direction?: Direction) => {
				/* Implementation */
			}, // Function for recalculating anchors
			resizable: writable(true), // Node is resizable by default
			zIndex: writable(1), // Default zIndex
			edge: null, // Default edge value (you can specify the type here)
			direction: writable('TD'), // Default direction (Top to Down)
			borderRadius: writable(5), // Default border radius
			borderWidth: writable(1), // Default border width
			connections: writable([]), // Empty connections array
			bgColor: writable('#007bff'), // Default background color
			borderColor: writable('#000'), // Default border color
			selectionColor: writable('#ff0000'), // Default selection color
			textColor: writable('#fff') // Default text color
		};
		let draggedNodeType: string | null = null;

		type Direction = 'TD' | 'LR';

		// Add the new node to the graph store
		graph.nodes.add(newNode, newNode.id);

		// Reset the dragged node type
		draggedNodeType = null;
	}

	//This function handles selecting nodes
	function selectNextNode() {
		const nodes = graph.nodes.getAll();

		const currentIndex = nodes.findIndex((node) => $selected.has(node));
		const nextIndex = currentIndex + 1;

		$selected.delete(nodes[currentIndex]);
		$selected.add(nodes[nextIndex]);
	}

	function handleKeyUp(e: KeyboardEvent) {
		const { key, code } = e;

		// Handle space release
		if (key === ' ' || code === 'Space') {
			spacePressed = false;
			return;
		}

		if (isArrow(key)) {
			clearInterval(activeIntervals[key]);
			delete activeIntervals[key];
		} else if (key === 'Shift') {
			connectingFrom.set(null);
		}
	}

	function handleScroll(e: WheelEvent) {
		if (fixedZoom) return;
		const multiplier = e.shiftKey ? 0.15 : 1;
		const { clientX, clientY, deltaY } = e;
		const currentTranslation = $translation;
		const pointerPosition = { x: clientX, y: clientY };

		// Check if deltaY has decimal places
		// If it does, it means the user is using a trackpad
		// Check if we should pan instead of zoom
		const modifierPressed = e[`${modifier}Key`];

		// Pan if: trackpadPan is true AND modifier is NOT pressed
		// OR if: trackpadPan is false AND modifier IS pressed
		if (trackpadPan && !modifierPressed) {
			$translation = {
				x: ($translation.x -= e.deltaX),
				y: ($translation.y -= e.deltaY)
			};
			return;
		}

		// If trackpadPan is false and modifier is not pressed, we zoom (default behavior)
		// If trackpadPan is true and modifier is pressed, we also zoom

		if (($scale >= MAX_SCALE && deltaY < 0) || ($scale <= MIN_SCALE && deltaY > 0)) return;

		// Calculate the scale adjustment
		const scrollAdjustment = Math.min(0.009 * multiplier * Math.abs(deltaY), 0.08);
		const newScale = calculateZoom($scale, Math.sign(deltaY), scrollAdjustment);

		// Calculate the translation adjustment
		const newTranslation = calculateTranslation(
			$scale,
			newScale,
			currentTranslation,
			pointerPosition,
			graphDimensions
		);

		// Apply transforms
		//
		scale.set(newScale);
		translation.set(newTranslation);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault(); // This is needed to allow dropping
	}

	//handles movement of camera in the canvas and the nodes
	function handleArrowKey(key: Arrow, e: KeyboardEvent) {
		const multiplier = e.shiftKey ? 2 : 1;
		// const start = performance.now();
		const direction = key === 'ArrowLeft' || key === 'ArrowUp' ? 1 : -1;
		const leftRight = key === 'ArrowLeft' || key === 'ArrowRight';
		const startOffset = leftRight ? $translation.x : $translation.y;
		const endOffset = startOffset + direction * PAN_INCREMENT * multiplier;

		if (!activeIntervals[key]) {
			const start = performance.now();
			let interval = setInterval(() => {
				const time = performance.now() - start;

				//movement of camera when no nodes are selected
				if ($selected.size === 0) {
					const movement = startOffset + (endOffset - startOffset) * (time / PAN_TIME);
					translation.set({
						x: leftRight ? movement : $translation.x,
						y: leftRight ? $translation.y : movement
					});
				} else {
					//movement of nodes when selected
					const delta = {
						x: leftRight ? -direction * 2 : 0,
						y: leftRight ? 0 : -direction * 2
					};
					Array.from($selected).forEach((node) => {
						const currentPosition = get(node.position);
						let groupBox: GroupBox | undefined;
						const groupName = get(node.group);

						const groupBoxes = get(graph.groupBoxes);

						if (groupName) groupBox = groupBoxes.get(groupName);
						if (groupBox) {
							const nodeWidth = get(node.dimensions.width);
							const nodeHeight = get(node.dimensions.height);
							const bounds = calculateRelativeBounds(groupBox, nodeWidth, nodeHeight);
							moveElementWithBounds(currentPosition, delta, node.position, bounds);
						} else {
							const newPos = {
								x: currentPosition.x + delta.x,
								y: currentPosition.y + delta.y
							};
							const snappedPos = getSnappedPosition(newPos.x, newPos.y);
							node.position.set(snappedPos);
							// moveElement(currentPosition, delta, node.position);
						}
					});
				}
			}, 2);
			activeIntervals[key] = interval;
		}
	}
	// // new definitions for Radio Group test
	// let options = ['option 1', 'option 2', 'option 3'];
	// let parameterStore = writable('default value');

	// // updated by team v.11.0
	// function handleDragOver(event: DragEvent) {
	// 	// Prevenir el comportamiento predeterminado para permitir el drop
	// 	event.preventDefault();
	// }

	// function handleDrop(event: DragEvent) {
	// 	// Manejar la lógica de lo que sucede cuando un elemento es soltado
	// 	event.preventDefault();
	// 	const jsonNodeFromDrawerController = event.dataTransfer?.getData('application/json');

	// 	if (jsonNodeFromDrawerController) {
	// 		// if true
	// 		const newNode = JSON.parse(jsonNodeFromDrawerController);
	// 		console.log('Elemento soltado:', newNode);
	// 	}
	// }
</script>

<!-- <button on:click={() => getJSONState(graph)}>SAVE STATE</button> -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->

<section
	role="presentation"
	id={graph.id}
	class="svelvet-wrapper"
	{title}
	style:width={width ? width + 'px' : '100%'}
	style:height={height ? height + 'px' : '100%'}
	style:cursor={spacePressed ? 'grab' : isMovable ? 'grabbing' : pannable ? 'move' : 'default'}
	on:wheel|preventDefault={handleScroll}
	on:mousedown|preventDefault|self={onMouseDown}
	on:touchend|preventDefault={onTouchEnd}
	on:touchstart|preventDefault|self={onTouchStart}
	on:keydown={handleKeyDown}
	on:keyup={handleKeyUp}
	on:dragover|preventDefault={handleDragOver}
	on:drop={handleDrop}
	bind:this={$graphDOMElement}
	tabindex={0}
>
	<GraphRenderer {isMovable} on:nodeClicked>
		{#if $editing}
			<Editor editing={$editing} />
		{/if}
		<slot />
	</GraphRenderer>

	{#if backgroundExists}
		<slot name="background" />
	{:else}
		<Background />
	{/if}
	{#if minimap}
		<svelte:component this={minimapComponent} />
	{/if}
	{#if controls}
		<svelte:component this={controlsComponent} />
	{/if}
	{#if toggle}
		<svelte:component this={toggleComponent} />
	{/if}
	{#if drawer}
		<svelte:component this={drawerComponent} />
	{/if}
	{#if contrast}
		<svelte:component this={contrastComponent} />
	{/if}
	<slot name="minimap" />
	<slot name="drawer" />
	<slot name="controls" />
	<slot name="toggle" />
	<slot name="contrast" />
	{#if selecting && !disableSelection}
		<SelectionBox {creating} {anchor} {graph} {adding} color={selectionColor} />
	{/if}
</section>

<svelte:window
	on:touchend={onMouseUp}
	on:mouseup={onMouseUp}
	on:resize={updateGraphDimensions}
	on:scroll={updateGraphDimensions}
/>

<style>
	.svelvet-wrapper {
		position: relative;
		overflow: hidden;
		cursor: move;
		font-family: 'Rubik';
		box-sizing: border-box !important;
		user-select: none;
		margin: 0;
		line-height: 1rem;
		font-size: 0.85rem;
		pointer-events: auto;
		color: var(--default-text-color);
	}
	.svelvet-wrapper:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgb(59, 102, 232);
	}
</style>
