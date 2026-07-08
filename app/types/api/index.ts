export type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  AuthResponse,
  LoginResponse,
  MeClaim,
  MeResponse,
  MeBffResponse,
} from './auth';

export type { ProblemDetails } from './common';

export type {
  Dealership,
  CreateDealershipRequest,
  UpdateDealershipRequest,
} from './dealership';

export type {
  ServiceTypeOption,
  BookingServiceTypesResponse,
  AvailabilitySlotDto,
  AvailabilityResponse,
  BookingVehicle,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
  CancelAppointmentRequest,
  AppointmentResponse,
} from './booking';

export { AppointmentStatus } from './booking';

export type { Skill, CreateSkillRequest } from './skill';

export type {
  ServiceType,
  CreateServiceTypeRequest,
  UpdateServiceTypeRequest,
} from './serviceType';

export type {
  ServiceBay,
  CreateServiceBayRequest,
  UpdateServiceBayRequest,
} from './serviceBay';

export type {
  TechnicianSkillSummary,
  Technician,
  CreateTechnicianRequest,
  UpdateTechnicianRequest,
} from './technician';

export type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from './customer';

export type {
  Vehicle,
  CreateVehicleRequest,
  UpdateVehicleRequest,
} from './vehicle';
