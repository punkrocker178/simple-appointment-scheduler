export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UpdateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
