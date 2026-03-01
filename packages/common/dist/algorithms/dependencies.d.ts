import { INode, IEdge } from '../types';
/**
 * Find all nodes that depend on the given node (direct and transitive)
 */
export declare function findDependents(nodeId: string, nodes: INode[], edges: IEdge[]): string[];
/**
 * Find all nodes that the given node depends on (direct and transitive)
 */
export declare function findDependencies(nodeId: string, nodes: INode[], edges: IEdge[]): string[];
/**
 * Detect cycles in the graph
 */
export declare function hasCycle(nodes: INode[], edges: IEdge[]): boolean;
//# sourceMappingURL=dependencies.d.ts.map