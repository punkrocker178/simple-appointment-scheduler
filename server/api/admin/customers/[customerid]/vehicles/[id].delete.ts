import { authenticatedBackendFetch } from '../../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const customerId = getRouterParam(event, 'customerid');
  const id = getRouterParam(event, 'id');
  await authenticatedBackendFetch(event, `/api/customers/${customerId}/vehicles/${id}`, {
    method: 'DELETE',
  });
  setResponseStatus(event, 204);
  return null;
});
