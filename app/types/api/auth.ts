export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  email: string;
  role: string;
}

export interface MeClaim {
  type: string;
  value: string;
}

export interface MeResponse {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  claims: MeClaim[];
}
