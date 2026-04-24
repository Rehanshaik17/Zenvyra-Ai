import env from '../config/env';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'zenyvra_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const signup = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${env.API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Signup failed');
  }
  const data: AuthResponse = await res.json();
  setToken(data.token);
  return data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${env.API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Login failed');
  }
  const data: AuthResponse = await res.json();
  setToken(data.token);
  return data;
};

export const getMe = async (): Promise<AuthUser> => {
  const res = await fetch(`${env.API_BASE_URL}/auth/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
};

export const logout = () => {
  removeToken();
};
