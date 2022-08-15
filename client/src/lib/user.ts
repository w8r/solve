import { User } from '../types/user';

export function getShortName(user: User): string {
  return user?.name
    .split(' ')
    .map((s) => s[0].toUpperCase())
    .join('');
}
