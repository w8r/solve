export const REVISION_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type RevisionStatusValue = typeof REVISION_STATUSES[keyof typeof REVISION_STATUSES];
