/**
 * Resolve post-login/register redirect from role and optional query override.
 */
export function getPostLoginRedirect(
  role: string,
  queryRedirect?: string | string[] | null,
): string {
  if (
    typeof queryRedirect === 'string'
    && queryRedirect.startsWith('/')
    && !queryRedirect.startsWith('//')
  ) {
    return queryRedirect;
  }
  if (role === 'User') {
    return '/booking-start';
  }
  return '/admin';
}
