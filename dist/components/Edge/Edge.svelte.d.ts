import { SvelteComponentTyped } from "svelte";
import { type OrthogonalEdgeOptions } from '../../utils/calculators/calculateStepPath';
import type { CSSColorString, EndStyle } from '../../types';
import type { WritableEdge } from '../../types';
declare const __propDef: {
    props: {
        edge?: WritableEdge | undefined;
        straight?: boolean | undefined;
        step?: boolean | undefined;
        orthogonal?: boolean | undefined;
        smartStep?: boolean | undefined;
        minimalStep?: boolean | undefined;
        directStep?: boolean | undefined;
        orthogonalOptions?: OrthogonalEdgeOptions | undefined;
        start?: EndStyle | undefined;
        end?: EndStyle | undefined;
        animate?: boolean | undefined;
        label?: string | undefined;
        enableHover?: boolean | undefined;
        edgeClick?: (() => void) | null | undefined;
        /**
             * @default 0.5
             * @type number
             * @description The position of the label along the edge. 0 is the source, 1 is the target.
             */ labelPosition?: number | undefined;
        width?: number | null | undefined;
        color?: CSSColorString | null | undefined;
        labelColor?: CSSColorString | null | undefined;
        textColor?: CSSColorString | null | undefined;
        cornerRadius?: number | undefined;
        targetColor?: CSSColorString | null | undefined;
        destroy?: (() => void) | undefined;
    };
    events: {
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
