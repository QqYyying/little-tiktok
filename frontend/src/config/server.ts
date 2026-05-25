// 后端服务配置占位文件
// TODO: 配置后端服务地址、端口等

export const serverConfig = {
  // API 服务配置
  api: {
    host: process.env.API_HOST || 'localhost',
    port: process.env.API_PORT || 8080,
  },
  // RPC 推荐服务配置
  rpc: {
    host: process.env.RPC_HOST || 'localhost',
    port: process.env.RPC_PORT || 9090,
  },
  // Redis 配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  // MySQL 配置
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DATABASE || 'mini_douyin',
  },
  // 对象存储配置
  storage: {
    type: process.env.STORAGE_TYPE || 'local', // 'local' | 'minio' | 'oss'
    endpoint: process.env.STORAGE_ENDPOINT || '',
    bucket: process.env.STORAGE_BUCKET || 'videos',
  },
}
