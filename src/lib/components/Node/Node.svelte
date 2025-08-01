<script context="module" lang="ts">
	import InternalNode from './InternalNode.svelte';
	import DefaultNode from './DefaultNode.svelte';
	import { get } from 'svelte/store';
	import { createNode } from '$lib/utils';
	import { getContext, onDestroy, onMount, setContext } from 'svelte';
	import type { ComponentType } from 'svelte';
	import type { NodeKey, Anchor, AnchorKey } from '$lib/types';
	import type { Graph, Node as NodeType, NodeConfig, GroupKey } from '$lib/types';
	import type { Connections, CSSColorString, InitialDimensions } from '$lib/types';
</script>

<script lang="ts">
	const graph = getContext<Graph>('graph');
	const group: GroupKey = getContext('group');

	//const storedNode = JSON.parse(localStorage.getItem('state'))?.nodes?[id]
	/**
	 * @default { x: 0, y: 0 }
	 * @description The position of the Node. These correspond to pixel values
	 * at default graph scale. This prop newly features two way data binding. Please report any issues
	 * on GitHub.
	 */
	export let position = { x: 0, y: 0 };
	export let drop: 'cursor' | 'center' | false = false;
	/**
	 * @type { width: number, height: number}
	 * @description Used to set the initial dimensions of the Node. Primarily used for default Nodes,
	 * but can be used with custom Nodes as well. This value does not currently feature two way binding
	 */
	export let dimensions: InitialDimensions | null = null;
	/**
	 * @default current node count
	 * @type string | number
	 * @description The id of the Node. This value does not currently feature two way binding
	 */
	export let id: string | number = 0;
	export let bgColor: CSSColorString | null = null;
	export let borderRadius: number | null = null;
	export let borderColor: CSSColorString | null = null;
	export let borderWidth: number | null = null;
	export let selectionColor: CSSColorString | null = null;
	export let textColor: CSSColorString | null = null;
	export let resizable = false;
	export let label = '';
	/**
	 * @default 1
	 * @type number
	 * @description The number of input anchors on a default Nodes. This value features two way binding,
	 */
	export let inputs = 1;
	/**
	 * @default 1
	 * @type number
	 * @description The number of output anchors on a default Node. This value features two way binding,
	 */
	export let outputs = 1;
	export let width: number | null = null;
	export let height: number | null = null;
	export let TD = false;
	export let LR = false;
	export let zIndex = 1;
	export let editable = true;
	export let locked = false;
	export let rotation = 0;
	export let edge: ComponentType | null = null;
	/**
	 * @default []
	 * @type Array<string | number | [string | number, string | number]>
	 * @description This prop is used to set the initial connections of a Node. It is an array of "connections",
	 * connections are either Node IDs, which can be strings or numbers, or a tuple of a Node ID and an Anchor ID. This does
	 * not feature two way data binding. Please use the let:connect and let:disconnect methods
	 * on the Node component to imperatively add and remove connections.
	 */
	export let connections: Connections = [];
	/**
	 * @default false
	 * @type boolean
	 * @description When true, the a custom Node will use the default styling provided by Svelvet.
	 */
	export let useDefaults = false;
	/**
	 * @default false
	 * @type boolean
	 * @description When true, the Node is placed in the center of the viewport on mount.
	 */
	export let center = false;
	/**
	 * @default false
	 * @type boolean
	 * @description This prop can be set to true to make the Anchors dynamically realign themselves
	 * based on the relative position of the source and target nodes.
	 */
	export let dynamic = false;
	export let title = '';

	//External stores
	const nodes = graph.nodes;

	setContext('dynamic', dynamic);

	let node: NodeType;
	let isDefault = true;

	onMount(() => {
		const direction = TD ? 'TD' : LR ? 'LR' : graph.direction;

		const groupBox = graph.groupBoxes.get(group);

		const nodeCount = graph.nodes.count() + 1;

		isDefault = !$$slots.default;
		if ($$slots.anchorWest || $$slots.anchorEast || $$slots.anchorNorth || $$slots.anchorSouth)
			isDefault = false;

		const initialDimensions: InitialDimensions = dimensions
			? dimensions
			: width || height
			? { width: width || height || 200, height: height || width || 100 }
			: isDefault
			? { width: 200, height: 100 }
			: { width: 0, height: 0 };

		const config: NodeConfig = {
			id: id || nodeCount,
			position:
				drop === 'cursor'
					? { x: get(graph.cursor).x, y: get(graph.cursor).y }
					: groupBox
					? { x: get(groupBox.position).x + position.x, y: get(groupBox.position).y + position.y }
					: position,
			dimensions: initialDimensions,
			editable: editable || graph.editable,
			label,
			group,
			resizable,
			inputs,
			outputs,
			zIndex,
			direction,
			locked,
			rotation
		};
		if (connections.length) config.connections = connections;
		if (borderWidth) config.borderWidth = borderWidth;
		if (borderRadius) config.borderRadius = borderRadius;
		if (borderColor) config.borderColor = borderColor;
		if (selectionColor) config.selectionColor = selectionColor;
		if (textColor) config.textColor = textColor;
		if (bgColor) config.bgColor = bgColor;
		if (edge) config.edge = edge;
		node = createNode(config);

		if (groupBox) {
			graph.groups.update((groups) => {
				const nodes = get(groups[group].nodes);
				groups[group].nodes.set(new Set([...nodes, node]));
				return groups;
			});
		}

		graph.nodes.add(node, node.id);
	});

	$: node && node.connections.set(connections);

	onDestroy(() => {
		graph.nodes.delete(node.id);
	});

	function connect(connections: number | string | [number | string, number | string]) {
		if (!node) return;
		node.connections.set([connections]);
	}

	function disconnect(connections: number | string | Connections) {
		if (!node) return;
		const adjustedConnections = Array.isArray(connections) ? connections : [connections];

		adjustedConnections.forEach((connection) => {
			const [nodeId, anchorId] = Array.isArray(connection) ? connection : [connection, null];
			const nodeKey: NodeKey = `N-${nodeId}`;
			const otherNode = graph.nodes.get(nodeKey);
			if (!otherNode) return;
			let specificAnchor: Anchor | null = null;
			const anchorKey: AnchorKey | null = anchorId ? `A-${anchorId}/${nodeKey}` : null;
			if (anchorKey) {
				specificAnchor = otherNode.anchors.get(anchorKey);
			}
			const matchingEdgeKeys = graph.edges.match(node, otherNode, specificAnchor);
			if (matchingEdgeKeys.length)
				graph.edges.delete(matchingEdgeKeys[matchingEdgeKeys.length - 1]);
		});
	}

	setContext('connect', connect);
	setContext('disconnect', disconnect);

	// All these functions below essentially enable data binding to the props
	// We should not recommend developers utilize this, but it is a nice feature
	$: if (node) {
		node.bgColor.set(bgColor);
	}
	$: if (node) {
		node.label.set(label);
	}
	$: if (node) {
		node.textColor.set(textColor);
	}
	$: if (node) {
		node.borderColor.set(borderColor);
	}
	$: if (node) {
		node.selectionColor.set(selectionColor);
	}
	$: if (node) {
		node.resizable.set(resizable);
	}
	$: if (node) {
		node.editable.set(editable);
	}
	$: if (node) {
		node.locked.set(locked);
	}
	$: if (node) {
		node.inputs.set(inputs);
	}
	$: if (node) {
		node.outputs.set(outputs);
	}
	$: if (node) {
		node.zIndex.set(zIndex);
	}

	$: nodePosition = node && node?.position;

	let priorPosition = position;

	$: if (node) {
		const { x: priorX, y: priorY } = priorPosition;
		const { x: nodeX, y: nodeY } = $nodePosition;
		const { x: propX, y: propY } = position;

		const areDifferent = propX !== nodeX || propY !== nodeY;

		const propChanged = propX !== priorX || propY !== priorY;

		if (areDifferent) {
			if (propChanged) {
				priorPosition = position;
				node.position.set(position);
			} else {
				priorPosition = $nodePosition;
				position = $nodePosition;
			}
		}
	}
	$: if (node) {
		node.inputs.set(inputs);
	}
	$: if (node) {
		node.outputs.set(outputs);
	}
</script>

{#if node && $nodes.get(node.id)}
	<InternalNode
		{node}
		center={center || drop === 'center'}
		{isDefault}
		{useDefaults}
		dimensionsProvided={!!dimensions || !!width || !!height || isDefault || false}
		nodeStore={graph.nodes}
		locked={graph.locked}
		groups={graph.groups}
		{title}
		maxZIndex={graph.maxZIndex}
		centerPoint={graph.center}
		cursor={graph.cursor}
		activeGroup={graph.activeGroup}
		editing={graph.editing}
		initialNodePositions={graph.initialNodePositions}
		on:nodeClicked
		on:nodeMount
		on:nodeReleased
		on:duplicate
		on:nodeDimensionsChanged
		let:destroy
		let:selected
		let:grabHandle
	>
		<slot {selected} {grabHandle} {disconnect} {connect} {node} {destroy}>
			{#if isDefault}
				<DefaultNode {selected} on:connection on:disconnection />
			{/if}
		</slot>

		<slot name="anchorWest" slot="anchorWest" />
		<slot name="anchorEast" slot="anchorEast" />
		<slot name="anchorNorth" slot="anchorNorth" />
		<slot name="anchorSouth" slot="anchorSouth" />
	</InternalNode>
{/if}
