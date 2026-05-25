// 中间件：Token 校验
// 后续连接真实后端时使用

import { NextRequest, NextResponse } from 'next/server'

export function authMiddleware(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      { code: 'UNAUTHORIZED', message: '未登录', data: null, requestId: '' },
      { status: 401 }
    )
  }

  // TODO: 验证 Token 有效性
  // 1. 解析 JWT
  // 2. 检查 Redis 黑名单
  // 3. 注入 userId 到请求上下文

  return null // 继续处理请求
}
