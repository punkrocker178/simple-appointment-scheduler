import { authenticatedBackendFetch } from '../../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const customerId = getRouterParam(event, 'customerid');
  return authenticatedBackendFetch(event, `/api/customers/${customerId}/vehicles`);
});
