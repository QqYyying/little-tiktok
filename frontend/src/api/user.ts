// 用户模块 API
import { api, ApiResponse } from './index'

export interface User {
  userId: string
  username: string
  createdAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  username: string
  password: string
}

// 用户注册
export const register = (data: RegisterRequest) =>
  api.post<User>('/user/register', data)

// 用户登录
export const login = (data: LoginRequest) =>
  api.post<LoginResponse>('/user/login', data)

// 退出登录
export const logout = () => api.post('/user/logout')

// 获取当前用户信息
export const getCurrentUser = () => api.get<User>('/user/me')
