export interface ServiceType {
  id: string;
  dealershipId: string;
  skillId: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface CreateServiceTypeRequest {
  skillId: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
}

export interface UpdateServiceTypeRequest {
  skillId: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
}
