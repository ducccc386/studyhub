import api from './api';

export interface LoginRequest {
  email: string;
  password?: string; // Optional if we are doing mock, but we made it required
}

export interface AuthResponse {
  token: string;
  role: 'ADMIN' | 'PARENT' | 'TUTOR';
  email: string;
  name?: string;
  avatar?: string;
  tutorId?: number;
  userId?: number;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  role: 'PARENT' | 'TUTOR';
  fullName?: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  googleLogin: async (credential: string, role?: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/google-login', { credential, role });
    return response.data;
  }
};
