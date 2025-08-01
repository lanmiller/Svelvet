import { SvelteComponentTyped } from 'svelte';
import type { NodeDrawerConfig, AnchorDrawerConfig, EdgeDrawerConfig } from '../../types';
export declare const defaultNodePropsStore: import('svelte/store').Writable<NodeDrawerConfig[]>;
export declare const createNodeProps: (
	edgeProps?: EdgeDrawerConfig,
	anchorProps?: {
		[key: string]: AnchorDrawerConfig[];
	}
) => any;
declare const __propDef: {
	props: Record<string, never>;
	events: {
		[evt: string]: CustomEvent<any>;
	};
	slots: {};
};
export type DrawerNodeProps = typeof __propDef.props;
export type DrawerNodeEvents = typeof __propDef.events;
export type DrawerNodeSlots = typeof __propDef.slots;
export default class DrawerNode extends SvelteComponentTyped<
	DrawerNodeProps,
	DrawerNodeEvents,
	DrawerNodeSlots
> {}
export {};
