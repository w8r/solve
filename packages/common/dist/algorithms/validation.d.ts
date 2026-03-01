import { IGraph, INode, IEdge } from '../types';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export declare function validateGraph(graph: IGraph, nodes: INode[], edges: IEdge[]): ValidationResult;
//# sourceMappingURL=validation.d.ts.map