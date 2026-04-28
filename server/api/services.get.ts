import { SERVICES } from '../utils/seedData';

export default defineEventHandler(() => {
  return {
    services: SERVICES,
  };
});
