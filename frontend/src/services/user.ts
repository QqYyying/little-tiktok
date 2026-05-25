// 用户服务接口定义
// 后续连接真实后端时实现

import { User } from '@/src/types/user'

export interface IUserService {
  // 用户注册
  register(username: string, password: string): Promise<User>
  // 用户登录
  login(username: string, password: string): Promise<{ token: string; user: User }>
  // 退出登录
  logout(token: string): Promise<void>
  // 获取用户信息
  getUserById(userId: string): Promise<User | null>
  // Token 校验
  verifyToken(token: string): Promise<User | null>
}
