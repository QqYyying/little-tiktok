-- 数据库表结构设计
-- MySQL DDL

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '用户ID',
  `username` VARCHAR(64) NOT NULL UNIQUE COMMENT '用户名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希(BCrypt)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 视频表
CREATE TABLE IF NOT EXISTS `video` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `video_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '视频ID',
  `title` VARCHAR(255) NOT NULL COMMENT '视频标题',
  `url` VARCHAR(512) NOT NULL COMMENT '视频URL',
  `cover_url` VARCHAR(512) DEFAULT '' COMMENT '封面URL',
  `author_id` VARCHAR(64) NOT NULL COMMENT '作者ID',
  `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_author_id` (`author_id`),
  INDEX `idx_like_count` (`like_count` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频表';

-- 点赞表
CREATE TABLE IF NOT EXISTS `like` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `video_id` VARCHAR(64) NOT NULL COMMENT '视频ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_video` (`user_id`, `video_id`),
  INDEX `idx_video_id` (`video_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表';

-- 浏览历史表（用于去重推荐）
CREATE TABLE IF NOT EXISTS `watch_history` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `video_id` VARCHAR(64) NOT NULL COMMENT '视频ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_video` (`user_id`, `video_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='浏览历史表';

-- 收藏表
CREATE TABLE IF NOT EXISTS `favorite` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `video_id` VARCHAR(64) NOT NULL COMMENT '视频ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_video` (`user_id`, `video_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_video_id` (`video_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';
