import { authenticatedBackendFetch } from '../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const dealershipId = getRouterParam(event, 'dealershipid');
  const query = getQuery(event);
  const { date, from, to } = query;

  const backendPath = from && to
    ? `/api/dealerships/${dealershipId}/appointments?from=${from}&to=${to}`
    : `/api/dealerships/${dealershipId}/appointments?date=${date}`;

  return authenticatedBackendFetch(event, backendPath);
});
