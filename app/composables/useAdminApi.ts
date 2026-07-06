/**
 * useAdminApi - Typed client for admin CRUD via Nitro BFF proxies
 *
 * Stateless wrappers around /api/admin/* routes.
 * Handles 401 (logout + redirect) and 403 (snackbar) globally.
 */
import type {
  CreateCustomerRequest,
  CreateDealershipRequest,
  CreateServiceBayRequest,
  CreateServiceTypeRequest,
  CreateSkillRequest,
  CreateTechnicianRequest,
  CreateVehicleRequest,
  Customer,
  Dealership,
  ServiceBay,
  ServiceType,
  Skill,
  Technician,
  UpdateCustomerRequest,
  UpdateDealershipRequest,
  UpdateServiceBayRequest,
  UpdateServiceTypeRequest,
  UpdateTechnicianRequest,
  UpdateVehicleRequest,
  Vehicle,
} from '~/types/api';
import { ApiError, getApiErrorStatusCode, toApiError } from '~/utils/apiErrors';

async function adminFetch<T>(url: string, options?: Record<string, unknown>): Promise<T> {
  try {
    return await $fetch<T>(url, options as Parameters<typeof $fetch>[1]);
  }
  catch (error: unknown) {
    const statusCode = getApiErrorStatusCode(error);
    const authStore = useAuthStore();
    const { showError } = useAppNotification();

    if (statusCode === 401) {
      await authStore.logout();
      await navigateTo('/login');
      throw toApiError(error);
    }

    const apiError = toApiError(error);

    if (statusCode === 403) {
      showError(apiError.message);
    }

    throw apiError;
  }
}

export function useAdminApi() {
  const fetchSkills = (): Promise<Skill[]> =>
    adminFetch('/api/admin/skills');

  const createSkill = (body: CreateSkillRequest): Promise<Skill> =>
    adminFetch('/api/admin/skills', { method: 'POST', body });

  const deleteSkill = (id: string): Promise<void> =>
    adminFetch(`/api/admin/skills/${id}`, { method: 'DELETE' });

  const fetchDealerships = (): Promise<Dealership[]> =>
    adminFetch('/api/admin/dealerships');

  const createDealership = (body: CreateDealershipRequest): Promise<Dealership> =>
    adminFetch('/api/admin/dealerships', { method: 'POST', body });

  const updateDealership = (id: string, body: UpdateDealershipRequest): Promise<Dealership> =>
    adminFetch(`/api/admin/dealerships/${id}`, { method: 'PUT', body });

  const fetchServiceTypes = (dealershipId: string): Promise<ServiceType[]> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/service-types`);

  const createServiceType = (dealershipId: string, body: CreateServiceTypeRequest): Promise<ServiceType> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/service-types`, { method: 'POST', body });

  const updateServiceType = (
    dealershipId: string,
    id: string,
    body: UpdateServiceTypeRequest,
  ): Promise<ServiceType> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/service-types/${id}`, { method: 'PUT', body });

  const deleteServiceType = (dealershipId: string, id: string): Promise<void> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/service-types/${id}`, { method: 'DELETE' });

  const fetchServiceBays = (dealershipId: string): Promise<ServiceBay[]> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/service-bays`);

  const createServiceBay = (dealershipId: string, body: CreateServiceBayRequest): Promise<ServiceBay> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/service-bays`, { method: 'POST', body });

  const updateServiceBay = (
    dealershipId: string,
    id: string,
    body: UpdateServiceBayRequest,
  ): Promise<ServiceBay> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/service-bays/${id}`, { method: 'PUT', body });

  const deleteServiceBay = (dealershipId: string, id: string): Promise<void> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/service-bays/${id}`, { method: 'DELETE' });

  const fetchTechnicians = (dealershipId: string): Promise<Technician[]> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/technicians`);

  const createTechnician = (dealershipId: string, body: CreateTechnicianRequest): Promise<Technician> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/technicians`, { method: 'POST', body });

  const updateTechnician = (
    dealershipId: string,
    id: string,
    body: UpdateTechnicianRequest,
  ): Promise<Technician> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/technicians/${id}`, { method: 'PUT', body });

  const deleteTechnician = (dealershipId: string, id: string): Promise<void> =>
    adminFetch(`/api/admin/dealerships/${dealershipId}/technicians/${id}`, { method: 'DELETE' });

  const fetchCustomers = (): Promise<Customer[]> =>
    adminFetch('/api/admin/customers');

  const createCustomer = (body: CreateCustomerRequest): Promise<Customer> =>
    adminFetch('/api/admin/customers', { method: 'POST', body });

  const updateCustomer = (id: string, body: UpdateCustomerRequest): Promise<Customer> =>
    adminFetch(`/api/admin/customers/${id}`, { method: 'PUT', body });

  const fetchVehicles = (customerId: string): Promise<Vehicle[]> =>
    adminFetch(`/api/admin/customers/${customerId}/vehicles`);

  const createVehicle = (customerId: string, body: CreateVehicleRequest): Promise<Vehicle> =>
    adminFetch(`/api/admin/customers/${customerId}/vehicles`, { method: 'POST', body });

  const updateVehicle = (
    customerId: string,
    id: string,
    body: UpdateVehicleRequest,
  ): Promise<Vehicle> =>
    adminFetch(`/api/admin/customers/${customerId}/vehicles/${id}`, { method: 'PUT', body });

  const deleteVehicle = (customerId: string, id: string): Promise<void> =>
    adminFetch(`/api/admin/customers/${customerId}/vehicles/${id}`, { method: 'DELETE' });

  return {
    fetchSkills,
    createSkill,
    deleteSkill,
    fetchDealerships,
    createDealership,
    updateDealership,
    fetchServiceTypes,
    createServiceType,
    updateServiceType,
    deleteServiceType,
    fetchServiceBays,
    createServiceBay,
    updateServiceBay,
    deleteServiceBay,
    fetchTechnicians,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
}
