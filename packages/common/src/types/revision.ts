export type RevisionStatus = "draft" | "published" | "archived";

export interface IRevision {
  _id: string;
  graphId: string;
  version: number;
  status: RevisionStatus;
  snapshotData: Record<string, unknown>;
  createdAt: Date;
  createdBy: string;
}
