// 数据库模型类型定义

export interface UserModel {
  id: number
  userId: string
  username: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface VideoModel {
  id: number
  videoId: string
  title: string
  url: string
  coverUrl: string
  authorId: string
  likeCount: number
  createdAt: Date
  updatedAt: Date
}

export interface LikeModel {
  id: number
  userId: string
  videoId: string
  createdAt: Date
}

export interface WatchHistoryModel {
  id: number
  userId: string
  videoId: string
  createdAt: Date
}
