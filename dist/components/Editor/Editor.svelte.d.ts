import { SvelteComponentTyped } from 'svelte';
import type { Node as SvelvetNode } from '../../types';
declare const __propDef: {
	props: {
		editing: SvelvetNode;
	};
	events: {
		[evt: string]: CustomEvent<any>;
	};
	slots: {};
};
export type EditorProps = typeof __propDef.props;
export type EditorEvents = typeof __propDef.events;
export type EditorSlots = typeof __propDef.slots;
export default class Editor extends SvelteComponentTyped<EditorProps, EditorEvents, EditorSlots> {}
export {};
