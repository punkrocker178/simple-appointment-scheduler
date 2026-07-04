export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
}

export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
}

export interface UpdateVehicleRequest {
  make: string;
  model: string;
  year: number;
}
