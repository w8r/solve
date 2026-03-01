import { INode, IEdge } from '../types';
type NodeVisitor = (node: INode) => void;
export declare function dfs(nodes: INode[], edges: IEdge[], startNodeId: string, visit: NodeVisitor): void;
export declare function bfs(nodes: INode[], edges: IEdge[], startNodeId: string, visit: NodeVisitor): void;
export {};
//# sourceMappingURL=traversal.d.ts.map