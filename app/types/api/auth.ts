export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface RegisterResponse {
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  email: string;
  role: string;
}

/** Public login payload returned by the BFF (token is stored in httpOnly cookie). */
export interface LoginResponse {
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
  customerId: string | null;
  permissions: string[];
  claims: MeClaim[];
}

/** BFF /api/auth/me response — includes session expiry from cookie. */
export interface MeBffResponse extends MeResponse {
  expiresAt: string;
}
