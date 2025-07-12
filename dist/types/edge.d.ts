import type { Writable, Readable } from 'svelte/store';
import type { Anchor, CSSColorString, EmValue, EdgeKey, CustomWritable, XYPair, Direction, Node } from '.';
import type { PixelValue, RemValue } from '.';
import type { ComponentType } from 'svelte';
export type EdgeStyle = 'straight' | 'step' | 'bezier' | 'orthogonal' | 'smart-step' | 'minimal-step' | 'direct-step';
export type EndStyle = 'arrow' | null;
export type WritableEdge = {
    id: EdgeKey;
    source: Anchor | CursorAnchor;
    target: Anchor | CursorAnchor;
    type: Writable<EdgeStyle | null>;
    color: Writable<CSSColorString | null> | CustomWritable<CSSColorString> | Readable<CSSColorString>;
    width: Writable<number>;
    label?: EdgeLabel;
    animated: Writable<boolean>;
    disconnect?: true;
    component: ComponentType | null;
    rendered: Writable<boolean>;
    start: EndStyle;
    end: EndStyle;
};
interface CursorNode {
    rotating: Writable<boolean>;
    position: Readable<XYPair>;
    dimensions: {
        width: Writable<number>;
        height: Writable<number>;
    };
    zIndex: Writable<number>;
}
export interface CursorAnchor {
    id: null;
    position: Readable<XYPair>;
    offset: Writable<XYPair>;
    connected: Writable<Set<Anchor>>;
    dynamic: Writable<boolean>;
    edge: null;
    edgeColor: Writable<null>;
    direction: Writable<Direction>;
    inputKey: null;
    type: 'output';
    mounted: Writable<true>;
    moving: Readable<boolean>;
    store: null;
    rotation: Readable<number>;
    node: CursorNode;
}
export interface EdgeLabel {
    text: Writable<string>;
    color: Writable<CSSColorString>;
    textColor: Writable<CSSColorString>;
    fontSize: Writable<PixelValue | RemValue | EmValue>;
    dimensions: {
        width: Writable<number>;
        height: Writable<number>;
    };
    borderRadius: Writable<number>;
}
export interface EdgeConfig {
    type?: EdgeStyle;
    color?: Writable<CSSColorString | null> | CustomWritable<CSSColorString> | Readable<CSSColorString>;
    width?: number;
    label?: EdgeLabelConfig;
    animated?: boolean;
    disconnect?: true;
    raiseEdges?: boolean;
    edgesAbove?: boolean;
    start?: EndStyle;
    end?: EndStyle;
}
export interface EdgeLabelConfig {
    text: string;
    color?: CSSColorString;
    textColor?: CSSColorString;
    fontSize?: PixelValue | RemValue;
    dimensions?: {
        width: number;
        height: number;
    };
    borderRadius?: number;
}
export type StepDirection = 'left' | 'right' | 'up' | 'down';
export type ArcKey = '1001' | '0110' | '100-1' | '0-110' | '-1001' | '0110' | '-100-1' | '0-110';
export type Connections = Array<[string | number, string | number] | string | number | null>;
export type CustomEdgeKey = Set<Anchor | Node> | 'cursor';
export {};
