import { isAllowedLoginUrl } from '@/config';

/** Sends the browser to the configured FamilySearch login address (SDD auth, section 2). */
export function startLogin(
  loginUrl: string,
  navigate: (url: string) => void = (url) => window.location.assign(url),
): void {
  if (!isAllowedLoginUrl(loginUrl)) throw new Error('The login address is not allowed');
  navigate(loginUrl);
}
