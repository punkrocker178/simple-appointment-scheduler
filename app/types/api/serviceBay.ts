export interface ServiceBay {
  id: string;
  dealershipId: string;
  name: string;
  isActive: boolean;
}

export interface CreateServiceBayRequest {
  name: string;
}

export interface UpdateServiceBayRequest {
  name: string;
}
