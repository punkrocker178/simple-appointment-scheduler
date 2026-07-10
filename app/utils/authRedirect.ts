/**
 * Resolve post-login/register redirect from role and optional query override.
 *
 * Query redirects are only honored when they match the role's area
 * (admin paths for Admin/Staff, non-admin paths for User). This prevents
 * `/` → `/booking-start` → `/login?redirect=/booking-start` from sending
 * staff into the customer booking flow.
 */
export function getPostLoginRedirect(
  role: string,
  queryRedirect?: string | string[] | null,
): string {
  const defaultPath = role === 'User' ? '/booking-start' : '/admin';

  if (
    typeof queryRedirect !== 'string'
    || !queryRedirect.startsWith('/')
    || queryRedirect.startsWith('//')
  ) {
    return defaultPath;
  }

  const isAdminPath
    = queryRedirect === '/admin' || queryRedirect.startsWith('/admin/');
  const isStaff = role === 'Admin' || role === 'Staff';

  if ((isStaff && !isAdminPath) || (role === 'User' && isAdminPath)) {
    return defaultPath;
  }
  return queryRedirect;
}
