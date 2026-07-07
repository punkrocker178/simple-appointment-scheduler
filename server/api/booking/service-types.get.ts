import { authenticatedBackendFetch } from '../../utils/authenticatedBackendFetch';

interface BackendCatalog {
  dealershipId: string;
  dealershipName: string;
  serviceTypes: Array<{
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    price: number;
  }>;
}

interface BackendServiceType {
  id: string;
  dealershipId: string;
  skillId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface BookingServiceType {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
}

export interface BookingServiceTypesResponse {
  dealershipId: string;
  dealershipName: string;
  serviceTypes: BookingServiceType[];
}

export default defineEventHandler(async (event): Promise<BookingServiceTypesResponse> => {
  const catalog = await authenticatedBackendFetch<BackendCatalog>(event, '/api/booking/catalog');
  const serviceTypes = await authenticatedBackendFetch<BackendServiceType[]>(
    event,
    `/api/dealerships/${catalog.dealershipId}/service-types`,
  );

  return {
    dealershipId: catalog.dealershipId,
    dealershipName: catalog.dealershipName,
    serviceTypes: serviceTypes
      .filter(st => st.isActive)
      .map(st => ({
        id: st.id,
        name: st.name,
        description: st.description,
        durationMinutes: st.durationMinutes,
        price: st.price,
      })),
  };
});
