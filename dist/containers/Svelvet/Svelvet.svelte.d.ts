import { SvelteComponentTyped } from "svelte";
import type { ComponentType } from 'svelte';
import type { Graph as GraphType, EdgeStyle, EndStyle, XYPair } from '../../types';
import type { NodeConfig, CSSColorString } from '../../types';
declare const __propDef: {
    props: {
        mermaid?: string;
        /**
             * @default light
             * @description This prop is used to interface with custom style blocks created using CSS. You can create any number of
             * themes with the following selector `:root[svelvet-theme="your-theme"]` and then pass the name of your theme
             * to this prop to apply it to the graph. Please see the docs for the CSS variables options. Svelvet reserves the "light" and "dark" themes for
             * internal use.
             */ theme?: string;
        id?: number | string;
        snapTo?: number;
        /**
             * @default 1
             * @description Sets initial zoom level of the graph. This value
             * features two way binding, so changing it will update the zoom.
             */ zoom?: number;
        TD?: boolean;
        editable?: boolean;
        locked?: boolean;
        width?: number;
        height?: number;
        minimap?: boolean;
        controls?: boolean;
        toggle?: boolean;
        drawer?: boolean;
        contrast?: boolean;
        /**
             * @default `false`
             * @description When `true`, the graph will automatically adjust translation
             * and scale to fit all nodes within the viewport. When set to `resize`, this
             * will continuously happen as the viewport changes size. This value is reactive.
             */ fitView?: boolean | "resize";
        /**
             * @default 'lightblue'
             * @description Color of the box used to select/group nodes
             */ selectionColor?: CSSColorString;
        edgeStyle?: EdgeStyle;
        endStyles?: Array<EndStyle>;
        edge?: ComponentType | null;
        /**
             * @default false
             * @description Boolean controlling whether or not Shift + Click enables the selection of multiple components.
             * This feature is enabled by default.
             */ disableSelection?: boolean;
        mermaidConfig?: Record<string, NodeConfig>;
        /**
             * @default { x: 0, y: 0 }
             * @type { x: number, y: number }
             * @description The initial translation of the graph. This value
             * does not currently feature two way binding
             */ translation?: XYPair;
        trackpadPan?: boolean;
        modifier?: "alt" | "ctrl" | "shift" | "meta";
        /**
             * @default false
             * @description When a Node is selected, this prop controls whether the
             * z-index of a connected edge should be raised.
             * Setting to `true` raises the edge regardless of
             * if the source or target is selected.
             */ raiseEdgesOnSelect?: boolean | "source" | "target";
        /**
             * @default false
             * @description Sets whether edges should, by default,
             * be placed above or below connected Nodes. Can be set
             * to `all` to force Edges above all nodes. Otherwise,
             * true essentially turns on `raiseEdgesOnSelect`, but places the
             * edges at higher z-Index than the Node.
             */ edgesAboveNode?: boolean | "all";
        title?: string;
        /**
             * @default false
             * @description Prevents the graph scale/zoom from changing.
             */ fixedZoom?: boolean;
        /**
             * @default true
             * @description Prevents the graph from panning on click if false
             */ pannable?: boolean;
        graph?: GraphType | null;
        disconnect?: (source: [string | number, string | number], target: [string | number, string | number]) => void;
    };
    events: {
        edgeDrop: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
        minimap: {
            slot: string;
        };
        controls: {
            slot: string;
        };
        background: {
            slot: string;
        };
        toggle: {
            slot: string;
        };
        drawer: {
            slot: string;
        };
        contrast: {
            slot: string;
        };
    };
};
export type SvelvetProps = typeof __propDef.props;
export type SvelvetEvents = typeof __propDef.events;
export type SvelvetSlots = typeof __propDef.slots;
export default class Svelvet extends SvelteComponentTyped<SvelvetProps, SvelvetEvents, SvelvetSlots> {
    get disconnect(): (source: [string | number, string | number], target: [string | number, string | number]) => void;
}
export {};
