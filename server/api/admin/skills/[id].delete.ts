import { authenticatedBackendFetch } from '../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  await authenticatedBackendFetch(event, `/api/skills/${id}`, {
    method: 'DELETE',
  });
  setResponseStatus(event, 204);
  return null;
});
