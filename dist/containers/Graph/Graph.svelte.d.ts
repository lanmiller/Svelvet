import { SvelteComponentTyped } from 'svelte';
import type { Graph, CSSColorString } from '../../types';
declare const __propDef: {
	props: {
		graph: Graph;
		width: number;
		height: number;
		minimap?: boolean;
		controls?: boolean;
		toggle?: boolean;
		fixedZoom?: boolean;
		pannable?: boolean;
		disableSelection?: boolean;
		ZOOM_INCREMENT?: number;
		PAN_INCREMENT?: number;
		PAN_TIME?: number;
		MAX_SCALE?: number;
		MIN_SCALE?: number;
		selectionColor: CSSColorString;
		backgroundExists: boolean;
		fitView?: boolean | 'resize';
		trackpadPan: boolean;
		modifier: 'alt' | 'ctrl' | 'shift' | 'meta';
		theme?: string;
		title: string;
		drawer?: boolean;
		contrast?: boolean;
	};
	events: {
		nodeClicked: CustomEvent<any>;
	} & {
		[evt: string]: CustomEvent<any>;
	};
	slots: {
		default: {};
		background: {};
		minimap: {};
		drawer: {};
		controls: {};
		toggle: {};
		contrast: {};
	};
};
export type GraphProps = typeof __propDef.props;
export type GraphEvents = typeof __propDef.events;
export type GraphSlots = typeof __propDef.slots;
export default class Graph extends SvelteComponentTyped<GraphProps, GraphEvents, GraphSlots> {}
export {};
