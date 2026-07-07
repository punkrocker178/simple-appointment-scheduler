import { authenticatedBackendFetch } from '../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return authenticatedBackendFetch(event, '/api/appointments', {
    method: 'POST',
    body,
  });
});
