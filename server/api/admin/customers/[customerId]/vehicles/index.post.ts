import { authenticatedBackendFetch } from '../../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const customerId = getRouterParam(event, 'customerId');
  const body = await readBody(event);
  return authenticatedBackendFetch(event, `/api/customers/${customerId}/vehicles`, {
    method: 'POST',
    body,
  });
});
