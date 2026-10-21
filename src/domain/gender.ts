import type { Gender } from './types';

export function toGender(raw: string | null | undefined): Gender {
  const value = raw?.trim().toLowerCase();
  if (value === 'male') return 'male';
  if (value === 'female') return 'female';
  return 'unknown';
}
