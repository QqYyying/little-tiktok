const AUTH_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

interface ApiEnvelope<T> {
  code: string
  message: string
  data: T
  requestId: string
}

export interface AuthUser {
  userId: string
  username: string
  status?: string
  role?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  userId: string
  username: string
  status: string
  role: string
  token: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface RegisterResponse {
  userId: string
  username: string
  status: string
  role: string
  createdAt: string
  updatedAt: string
}

function buildHeaders(extraHeaders: HeadersInit = {}) {
  const token = typeof window === 'undefined' ? null : localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }
}

async function unwrapResponse<T>(response: Response): Promise<T> {
  const payload: ApiEnvelope<T> = await response.json()
  if (!response.ok || payload.code !== 'OK') {
    throw new Error(payload.message || '请求失败')
  }
  return payload.data
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${AUTH_API_BASE}/auth/register`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(data),
  })
  return unwrapResponse<RegisterResponse>(response)
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${AUTH_API_BASE}/auth/login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(data),
  })
  return unwrapResponse<LoginResponse>(response)
}

export async function logout(): Promise<void> {
  const response = await fetch(`${AUTH_API_BASE}/auth/logout`, {
    method: 'POST',
    headers: buildHeaders(),
  })
  await unwrapResponse(response)
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await fetch(`${AUTH_API_BASE}/auth/me`, {
    method: 'GET',
    headers: buildHeaders(),
  })
  return unwrapResponse<AuthUser>(response)
}
