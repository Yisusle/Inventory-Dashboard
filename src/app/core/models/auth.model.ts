export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  email: string;
}

export interface AuthSession {
  token: string;
  username: string;
  role: 'Admin' | 'User';
}
