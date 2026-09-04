import { request, setToken } from "./client";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  wellnessGoal: string;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: string;
}

export async function register(data: { firstName: string; lastName?: string; email: string; password: string; goal?: string }) {
  const res: any = await request<{ token: string; user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.token) setToken(res.token);
  return res;
}

export async function login(email: string, password: string) {
  const res: any = await request<{ token: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (res.token) setToken(res.token);
  return res;
}

export async function getMe() {
  return request<AuthUser>("/auth/me", { method: "GET" });
}

export async function logout() {
  setToken(null);
  try { await request("/auth/logout", { method: "POST" }); } catch {}
}
