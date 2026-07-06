import { authenticatedBackendFetch } from '../../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const dealershipId = getRouterParam(event, 'dealershipId');
  return authenticatedBackendFetch(event, `/api/dealerships/${dealershipId}/technicians`);
});
