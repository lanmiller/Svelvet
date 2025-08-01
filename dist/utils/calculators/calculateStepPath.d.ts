import type { XYPair } from '../../types';
export interface VectorPlusPosition extends XYPair {
    direction: XYPair;
}
export interface OrthogonalEdgeOptions {
    cornerRadius?: number;
    stepBuffer?: number;
    bendingRules?: 'smart' | 'minimal' | 'direct';
    preferredDirection?: 'horizontal' | 'vertical' | 'auto';
    avoidOverlap?: boolean;
    maxBends?: number;
}
export interface SmartStepPathOptions extends OrthogonalEdgeOptions {
    nodeWidth?: number;
    nodeHeight?: number;
    gridSize?: number;
    obstacleAvoidance?: boolean;
}
export declare function calculateSmartStepPath(source: VectorPlusPosition, target: VectorPlusPosition, options?: SmartStepPathOptions): XYPair[];
export declare function calculateStepPath(source: VectorPlusPosition, target: VectorPlusPosition, buffer: number): {
    x: number;
    y: number;
}[];
export declare function areCrossing(vec1: VectorPlusPosition, vec2: VectorPlusPosition): boolean;
