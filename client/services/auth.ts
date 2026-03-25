const BASE_URL = "http://localhost:4000/api";

export interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

export interface AuthError {
  error: string;
}

function saveSession(token: string, user: AuthResponse["user"]) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getUser(): AuthResponse["user"] | null {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    logout(); // clear the stale token immediately
    return false;
  }
  return true;
}

// ── API calls ──────────────────────────────────────────
export async function signup(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as AuthError).error || "Signup failed");
  }

  saveSession(data.token, data.user);
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as AuthError).error || "Login failed");
  }

  saveSession(data.token, data.user);
  return data;
}