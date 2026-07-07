import { authenticatedBackendFetch } from '../../utils/authenticatedBackendFetch';

interface BackendDefaultDealership {
  dealershipId: string;
  dealershipName: string;
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
  const dealership = await authenticatedBackendFetch<BackendDefaultDealership>(
    event,
    '/api/booking/dealership',
  );
  const serviceTypes = await authenticatedBackendFetch<BackendServiceType[]>(
    event,
    `/api/dealerships/${dealership.dealershipId}/service-types`,
  );

  return {
    dealershipId: dealership.dealershipId,
    dealershipName: dealership.dealershipName,
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
