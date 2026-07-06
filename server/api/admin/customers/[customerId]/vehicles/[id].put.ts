import { authenticatedBackendFetch } from '../../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const customerId = getRouterParam(event, 'customerId');
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return authenticatedBackendFetch(event, `/api/customers/${customerId}/vehicles/${id}`, {
    method: 'PUT',
    body,
  });
});
