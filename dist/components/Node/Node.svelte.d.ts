import { SvelteComponentTyped } from 'svelte';
import type { ComponentType } from 'svelte';
import type { Node as NodeType } from '../../types';
import type { Connections, CSSColorString, InitialDimensions } from '../../types';
declare const __propDef: {
	props: {
		/**
		 * @default { x: 0, y: 0 }
		 * @description The position of the Node. These correspond to pixel values
		 * at default graph scale. This prop newly features two way data binding. Please report any issues
		 * on GitHub.
		 */ position?: {
			x: number;
			y: number;
		};
		drop?: 'cursor' | 'center' | false;
		/**
		 * @type { width: number, height: number}
		 * @description Used to set the initial dimensions of the Node. Primarily used for default Nodes,
		 * but can be used with custom Nodes as well. This value does not currently feature two way binding
		 */ dimensions?: InitialDimensions | null;
		/**
		 * @default current node count
		 * @type string | number
		 * @description The id of the Node. This value does not currently feature two way binding
		 */ id?: string | number;
		bgColor?: CSSColorString | null;
		borderRadius?: number | null;
		borderColor?: CSSColorString | null;
		borderWidth?: number | null;
		selectionColor?: CSSColorString | null;
		textColor?: CSSColorString | null;
		resizable?: boolean;
		label?: string;
		/**
		 * @default 1
		 * @type number
		 * @description The number of input anchors on a default Nodes. This value features two way binding,
		 */ inputs?: number;
		/**
		 * @default 1
		 * @type number
		 * @description The number of output anchors on a default Node. This value features two way binding,
		 */ outputs?: number;
		width?: number | null;
		height?: number | null;
		TD?: boolean;
		LR?: boolean;
		zIndex?: number;
		editable?: boolean;
		locked?: boolean;
		rotation?: number;
		edge?: ComponentType | null;
		/**
		 * @default []
		 * @type Array<string | number | [string | number, string | number]>
		 * @description This prop is used to set the initial connections of a Node. It is an array of "connections",
		 * connections are either Node IDs, which can be strings or numbers, or a tuple of a Node ID and an Anchor ID. This does
		 * not feature two way data binding. Please use the let:connect and let:disconnect methods
		 * on the Node component to imperatively add and remove connections.
		 */ connections?: Connections;
		/**
		 * @default false
		 * @type boolean
		 * @description When true, the a custom Node will use the default styling provided by Svelvet.
		 */ useDefaults?: boolean;
		/**
		 * @default false
		 * @type boolean
		 * @description When true, the Node is placed in the center of the viewport on mount.
		 */ center?: boolean;
		/**
		 * @default false
		 * @type boolean
		 * @description This prop can be set to true to make the Anchors dynamically realign themselves
		 * based on the relative position of the source and target nodes.
		 */ dynamic?: boolean;
		title?: string;
	};
	events: {
		nodeClicked: CustomEvent<any>;
		nodeMount: CustomEvent<any>;
		nodeReleased: CustomEvent<any>;
		duplicate: CustomEvent<any>;
		nodeDimensionsChanged: CustomEvent<any>;
		connection: CustomEvent<any>;
		disconnection: CustomEvent<any>;
	} & {
		[evt: string]: CustomEvent<any>;
	};
	slots: {
		default: {
			selected: boolean;
			grabHandle: (node: HTMLElement) => {
				destroy(): void;
			};
			disconnect: (connections: number | string | Connections) => void;
			connect: (connections: number | string | [number | string, number | string]) => void;
			node: NodeType;
			destroy: () => void;
		};
		anchorWest: {
			slot: string;
		};
		anchorEast: {
			slot: string;
		};
		anchorNorth: {
			slot: string;
		};
		anchorSouth: {
			slot: string;
		};
	};
};
export type NodeProps = typeof __propDef.props;
export type NodeEvents = typeof __propDef.events;
export type NodeSlots = typeof __propDef.slots;
export default class Node extends SvelteComponentTyped<NodeProps, NodeEvents, NodeSlots> {}
export {};
