import { authenticatedBackendFetch } from '../../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const customerId = getRouterParam(event, 'customerId');
  return authenticatedBackendFetch(event, `/api/customers/${customerId}/vehicles`);
});
