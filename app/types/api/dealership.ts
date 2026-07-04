export interface Dealership {
  id: string;
  name: string;
  address: string;
  phone: string;
  timezone: string;
  openSecondsFromMidnight: number;
  closeSecondsFromMidnight: number;
}

export interface CreateDealershipRequest {
  name: string;
  address: string;
  phone: string;
  timezone: string;
  openSecondsFromMidnight?: number;
  closeSecondsFromMidnight?: number;
}

export interface UpdateDealershipRequest {
  name: string;
  address: string;
  phone: string;
  timezone: string;
  openSecondsFromMidnight: number;
  closeSecondsFromMidnight: number;
}
