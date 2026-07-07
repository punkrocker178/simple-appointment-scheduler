import { authenticatedBackendFetch } from '../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const dealershipId = getRouterParam(event, 'dealershipid');
  const query = getQuery(event);
  const date = query.date as string;
  return authenticatedBackendFetch(
    event,
    `/api/dealerships/${dealershipId}/appointments?date=${date}`,
  );
});
