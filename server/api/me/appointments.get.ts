import { authenticatedBackendFetch } from '../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  return authenticatedBackendFetch(event, '/api/me/appointments');
});
