// 推荐服务接口定义（RPC 调用）
// 后续通过 gRPC/Dubbo 连接推荐服务

export interface IRecommendService {
  // 获取推荐视频ID列表
  getRecommendVideoIds(userId: string, count: number): Promise<string[]>
}

// RPC 请求结构
export interface RecommendRequest {
  userId: string
  count: number
}

// RPC 响应结构
export interface RecommendResponse {
  videoIds: string[]
}
