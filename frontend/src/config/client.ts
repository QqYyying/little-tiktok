// 客户端配置
export const clientConfig = {
  // API 基础路径
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  // 视频流预加载数量
  videoPreloadCount: 5,
  // 分页大小
  pageSize: 10,
}
