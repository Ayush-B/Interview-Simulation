import { http } from "./https";

type AuthResponse = {
  token: string;
  user?: { id: string; name?: string; email: string };
};

export async function signup(payload: { name: string; email: string; password: string }) {
  const { data } = await http.post<AuthResponse>("/api/auth/signup", payload);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await http.post<AuthResponse>("/api/auth/login", payload);
  return data;
}