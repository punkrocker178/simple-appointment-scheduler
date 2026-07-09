import { authenticatedBackendFetch } from '../../../../utils/authenticatedBackendFetch';

export default defineEventHandler(async (event) => {
  const dealershipId = getRouterParam(event, 'dealershipid');
  const query = getQuery(event);
  const params = new URLSearchParams();

  const from = query.from;
  const to = query.to;
  const date = query.date;

  if (typeof from === 'string' && from.length > 0 && typeof to === 'string' && to.length > 0) {
    params.set('from', from);
    params.set('to', to);
  } else if (typeof date === 'string' && date.length > 0) {
    params.set('date', date);
  }

  const queryString = params.toString();
  const path = queryString
    ? `/api/dealerships/${dealershipId}/appointments?${queryString}`
    : `/api/dealerships/${dealershipId}/appointments`;

  return authenticatedBackendFetch(event, path);
});
