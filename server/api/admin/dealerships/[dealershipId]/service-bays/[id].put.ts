import { authenticatedBackendFetch } from '../../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const dealershipId = getRouterParam(event, 'dealershipId');
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return authenticatedBackendFetch(event, `/api/dealerships/${dealershipId}/service-bays/${id}`, {
    method: 'PUT',
    body,
  });
});
