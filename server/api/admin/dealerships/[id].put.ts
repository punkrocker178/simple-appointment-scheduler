import { authenticatedBackendFetch } from '../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  return authenticatedBackendFetch(event, `/api/dealerships/${id}`, {
    method: 'PUT',
    body,
  });
});
