import { SvelteComponentTyped } from "svelte";
import { type OrthogonalEdgeOptions } from '../../utils/calculators/calculateStepPath';
import type { CSSColorString, EndStyle } from '../../types';
import type { WritableEdge } from '../../types';
declare const __propDef: {
    props: {
        edge?: WritableEdge;
        straight?: boolean;
        step?: boolean;
        orthogonal?: boolean;
        smartStep?: boolean;
        minimalStep?: boolean;
        directStep?: boolean;
        orthogonalOptions?: OrthogonalEdgeOptions;
        start?: EndStyle;
        end?: EndStyle;
        animate?: boolean;
        label?: string;
        enableHover?: boolean;
        edgeClick?: null | (() => void);
        /**
             * @default 0.5
             * @type number
             * @description The position of the label along the edge. 0 is the source, 1 is the target.
             */ labelPosition?: number;
        width?: number | null;
        color?: CSSColorString | null;
        labelColor?: CSSColorString | null;
        textColor?: CSSColorString | null;
        cornerRadius?: number;
        targetColor?: CSSColorString | null;
        destroy?: () => void;
    };
    events: {
        mousedown: MouseEvent;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            path: string;
            destroy: () => void;
            hovering: boolean;
        };
        label: {
            destroy: () => void;
            hovering: boolean;
        };
    };
};
export type EdgeProps = typeof __propDef.props;
export type EdgeEvents = typeof __propDef.events;
export type EdgeSlots = typeof __propDef.slots;
export default class Edge extends SvelteComponentTyped<EdgeProps, EdgeEvents, EdgeSlots> {
    get destroy(): () => void;
}
export {};
