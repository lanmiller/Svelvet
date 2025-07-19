import type { Node, Anchor } from '$lib/types';

export interface SvelvetConnectionEvent {
	sourceNode: Node;
	sourceAnchor: Anchor;
	targetNode: Node;
	targetAnchor: Anchor;
}

export interface AnchorConnectionEvent {
	node: Node;
	anchor: Anchor;
	connectedNode: Node;
	connectedAnchor: Anchor;
}

export interface NodeDimensionsChangedEvent {
	node: Node;
	nodeId: string | number;
	oldDimensions: { width: number; height: number };
	newDimensions: { width: number; height: number };
}
