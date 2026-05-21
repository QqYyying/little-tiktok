-- =============================================================================
-- MiniTikTok 数据库结构初始化 (DDL)
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 用户表
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户唯一ID（自增主键）',
  `username` varchar(32) NOT NULL COMMENT '用户名（建立唯一索引，用于注册查重）',
  `password_hash` varchar(100) NOT NULL COMMENT 'BCrypt强哈希加密后的密码密文（禁止明文存储）',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE' COMMENT '账号状态：ACTIVE-正常，BANNED-封禁',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=1001 DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

-- 2. 视频元数据表 (去掉 DESC 降序后缀，完美兼容 MySQL 5.7)
DROP TABLE IF EXISTS `video`;
CREATE TABLE `video` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '视频唯一ID',
  `author_id` bigint(20) NOT NULL COMMENT '发布作者的用户ID',
  `title` varchar(128) NOT NULL COMMENT '视频标题/描述',
  `play_url` varchar(255) NOT NULL COMMENT '视频在对象存储(MinIO/OSS)中的存储相对/绝对URL路径',
  `cover_url` varchar(255) NOT NULL COMMENT '视频封面图在对象存储中的存储URL路径',
  `like_count` int(11) NOT NULL DEFAULT '0' COMMENT '冗余计数：点赞总数（用于冷启动或同步Redis热度榜）',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE' COMMENT '视频状态：ACTIVE-正常上架，DELETED-下架逻辑删除',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  PRIMARY KEY (`id`),
  KEY `idx_author_id` (`author_id`) COMMENT '加速“我的视频”列表分页查询',
  KEY `idx_recommend_sort` (`status`, `like_count`, `created_at`) COMMENT '联合索引完美加速RPC推荐流查询'
) ENGINE=InnoDB AUTO_INCREMENT=5001 DEFAULT CHARSET=utf8mb4 COMMENT='视频元数据表';

-- 3. 用户访问历史表
DROP TABLE IF EXISTS `video_view`;
CREATE TABLE `video_view` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '访问用户ID',
  `video_id` bigint(20) NOT NULL COMMENT '浏览过的视频ID',
  `viewed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近一次访问时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_video_view` (`user_id`, `video_id`) COMMENT '联合唯一索引：保障“访问过不再推荐”的去重过滤速度'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户视频访问历史表';

-- 4. 用户视频点赞关系表
DROP TABLE IF EXISTS `video_like`;
CREATE TABLE `video_like` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '点赞用户ID',
  `video_id` bigint(20) NOT NULL COMMENT '被点赞的视频ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_video_like` (`user_id`, `video_id`) COMMENT '联合唯一索引：从根本上杜绝单个用户对同一视频重复刷点赞分'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户视频点赞关系表';

-- 5. 请求与耗时日志表
DROP TABLE IF EXISTS `request_log`;
CREATE TABLE `request_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '日志主键ID',
  `user_id` bigint(20) DEFAULT NULL COMMENT '请求发起人ID（匿名接口或未登录时为NULL）',
  `interface_name` varchar(100) NOT NULL COMMENT '接口路由或方法名(如 /feed 或 UserController.login)',
  `input_data` text COMMENT '经安全脱敏、截断后的输入请求参数快照(JSON字符串)',
  `output_data` text COMMENT '经安全脱敏、截断后的输出响应快照(JSON字符串)',
  `cost_time` bigint(20) NOT NULL COMMENT '接口内部核心业务执行总耗时（毫秒ms）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '审计记录时间',
  PRIMARY KEY (`id`),
  KEY `idx_cost_time` (`cost_time`) COMMENT '便于系统集成监控快速筛选慢接口性能红线'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统接口请求与耗时审计日志表';

SET FOREIGN_KEY_CHECKS = 1;