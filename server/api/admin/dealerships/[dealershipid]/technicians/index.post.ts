import { authenticatedBackendFetch } from '../../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const dealershipId = getRouterParam(event, 'dealershipid');
  const body = await readBody(event);
  return authenticatedBackendFetch(event, `/api/dealerships/${dealershipId}/technicians`, {
    method: 'POST',
    body,
  });
});
