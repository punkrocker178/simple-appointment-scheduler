import { authenticatedBackendFetch } from '../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return authenticatedBackendFetch(event, '/api/me/customer', {
    method: 'PUT',
    body,
  });
});
