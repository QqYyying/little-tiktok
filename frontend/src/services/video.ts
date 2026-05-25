// 视频服务接口定义
// 后续连接真实后端时实现

import { Video } from '@/src/types/video'

export interface IVideoService {
  // 获取推荐视频
  getRecommendVideos(userId: string, count: number): Promise<Video[]>
  // 获取用户的视频列表
  getUserVideos(userId: string, page: number, pageSize: number): Promise<{ videos: Video[]; total: number }>
  // 上传视频
  uploadVideo(userId: string, title: string, file: File): Promise<Video>
  // 删除视频
  deleteVideo(userId: string, videoId: string): Promise<void>
  // 上报已读视频
  reportWatched(userId: string, videoId: string): Promise<void>
}
