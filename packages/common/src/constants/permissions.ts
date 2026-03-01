export const PERMISSIONS = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
