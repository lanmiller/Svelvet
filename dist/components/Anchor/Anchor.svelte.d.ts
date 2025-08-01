import { SvelteComponentTyped } from 'svelte';
import type { Node, Connections, CSSColorString, EdgeStyle, EndStyle } from '../../types';
import type { Direction, CustomWritable } from '../../types';
import type { OutputStore, InputStore, ConnectingFrom } from '../../types';
import type { ComponentType } from 'svelte';
import type { Writable, Readable } from 'svelte/store';
export declare const connectingFrom: Writable<ConnectingFrom | null>;
export declare function changeAnchorSide(
	anchorElement: HTMLElement,
	newSide: Direction,
	node: Node
): void;
declare const __propDef: {
	props: {
		bgColor?: CSSColorString | null;
		id?: string | number;
		input?: boolean;
		output?: boolean;
		/**
		 * @default 'false'
		 * @description When `true`, the provided id will be used as-is without A- prefix and /nodeId suffix
		 */ useRawId?: boolean;
		/**
		 * @default dependent on `input` and `output` props
		 * @description When `true`, the Anchor will accept multiple connections. This is set to true by default
		 * for output anchors or anchors that have not specified an input/output prop.
		 */ multiple?: boolean;
		/**
		 * @default 'false'
		 * @description When `true`, the Anchor will dynamically change its direction
		 * based on the relative positioning of connected Nodes
		 */ dynamic?: boolean;
		edge?: ComponentType | null;
		inputsStore?: InputStore | null;
		key?: string | number | null;
		outputStore?: OutputStore | null;
		connections?: Connections;
		edgeColor?:
			| Writable<CSSColorString | null>
			| CustomWritable<CSSColorString>
			| Readable<CSSColorString>;
		edgeLabel?: string;
		/**
		 * @default 'false'
		 * @description When `true`, connections and disconnections are not allowed. Updates the cursor on hover.
		 */ locked?: boolean;
		/**
		 * @default 'false'
		 * @description When `true`, mouse up events on the parent Node will trigger connections to this Anchor. If this value
		 * is true for multiple Anchors, connections will be assigned in order, unless an Anchor is set to accept multiple connections.
		 */ nodeConnect?: boolean;
		edgeStyle?: EdgeStyle | null;
		endStyles?: Array<EndStyle>;
		/**
		 * @default 'false'
		 * @description When `true`, the default Anchor will not be rendered. It is not necessary to set this to true
		 * when passing custom Anchors as children. It likely only makes sense to use this
		 * in combination with the  `nodeConnect` prop.
		 */ invisible?: boolean;
		direction?: Direction;
		title?: string;
		disconnect?: (target: [string | number, string | number]) => void;
	};
	events: {
		[evt: string]: CustomEvent<any>;
	};
	slots: {
		default: {
			linked: boolean;
			hovering: boolean;
			connecting: boolean;
		};
		edge: {};
	};
};
export type AnchorProps = typeof __propDef.props;
export type AnchorEvents = typeof __propDef.events;
export type AnchorSlots = typeof __propDef.slots;
export default class Anchor extends SvelteComponentTyped<AnchorProps, AnchorEvents, AnchorSlots> {
	get disconnect(): (target: [string | number, string | number]) => void;
}
export {};
