// 用户类型定义
export interface User {
  userId: string
  username: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
