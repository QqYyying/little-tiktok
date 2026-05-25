// 点赞服务接口定义
// 后续连接真实后端时实现

export interface ILikeService {
  // 点赞视频
  likeVideo(userId: string, videoId: string): Promise<{ liked: boolean; likeCount: number }>
  // 取消点赞
  unlikeVideo(userId: string, videoId: string): Promise<{ liked: boolean; likeCount: number }>
  // 获取点赞状态
  getLikeStatus(userId: string, videoId: string): Promise<{ liked: boolean; likeCount: number }>
  // 批量获取点赞状态
  batchGetLikeStatus(userId: string, videoIds: string[]): Promise<Map<string, boolean>>
}
