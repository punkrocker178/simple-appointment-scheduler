import { authenticatedBackendFetch } from '../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const params = new URLSearchParams();

  for (const key of ['dealershipId', 'serviceTypeId', 'date'] as const) {
    const value = query[key];
    if (typeof value === 'string' && value.length > 0) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  const path = queryString ? `/api/availability?${queryString}` : '/api/availability';

  return authenticatedBackendFetch(event, path);
});
