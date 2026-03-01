export type OperationType = "CREATE_NODE" | "UPDATE_NODE" | "DELETE_NODE" | "CREATE_EDGE" | "DELETE_EDGE" | "UPDATE_GRAPH";
export interface IOperation {
    _id: string;
    graphId: string;
    userId: string;
    type: OperationType;
    target: {
        collection: string;
        id: string;
    };
    data: Record<string, unknown>;
    timestamp: Date;
}
//# sourceMappingURL=operation.d.ts.map