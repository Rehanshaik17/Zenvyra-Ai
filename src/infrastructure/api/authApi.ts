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
  try {
    const res = await fetch(`${env.API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Signup failed (${res.status} ${res.statusText})`);
    }
    setToken(data.token);
    return data;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message?.includes('fetch')) {
      throw new Error(`Cannot connect to server at ${env.API_BASE_URL}. Ensure backend is deployed and VITE_API_BASE_URL is set.`);
    }
    throw err;
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${env.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Login failed (${res.status} ${res.statusText})`);
    }
    setToken(data.token);
    return data;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message?.includes('fetch')) {
      throw new Error(`Cannot connect to server at ${env.API_BASE_URL}. Ensure backend is deployed and VITE_API_BASE_URL is set.`);
    }
    throw err;
  }
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
