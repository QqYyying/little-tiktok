// 常量配置

// API 配置
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  TIMEOUT: 10000,
}

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  VIDEO_FEED_PRELOAD: 5,  // 视频流预加载数量
  MIN_BUFFER: 2,          // 缓冲区最小剩余数量
}

// 路由路径
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  UPLOAD: '/upload',
  MY_VIDEOS: '/my-videos',
}

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络错误，请稍后重试',
  UNAUTHORIZED: '请先登录',
  PERMISSION_DENIED: '无权限执行此操作',
  NOT_FOUND: '资源不存在',
  UNKNOWN: '未知错误',
}
