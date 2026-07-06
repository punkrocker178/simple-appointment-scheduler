import { authenticatedBackendFetch } from '../../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const dealershipId = getRouterParam(event, 'dealershipid');
  const id = getRouterParam(event, 'id');
  await authenticatedBackendFetch(event, `/api/dealerships/${dealershipId}/service-types/${id}`, {
    method: 'DELETE',
  });
  setResponseStatus(event, 204);
  return null;
});
