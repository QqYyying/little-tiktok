-- =============================================================================
-- MiniTikTok current schema v3 (DDL)
-- This version matches the current backend codebase.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `token_blacklist`;
DROP TABLE IF EXISTS `request_log`;
DROP TABLE IF EXISTS `video_like`;
DROP TABLE IF EXISTS `video_view`;
DROP TABLE IF EXISTS `video`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` varchar(64) NOT NULL COMMENT 'user id, for example usr_xxx',
  `username` varchar(32) NOT NULL COMMENT 'username',
  `password_hash` varchar(100) NOT NULL COMMENT 'bcrypt password hash',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE or BANNED',
  `role` varchar(32) NOT NULL DEFAULT 'USER' COMMENT 'user role',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='user table';

CREATE TABLE `video` (
  `id` varchar(64) NOT NULL COMMENT 'video id, for example vid_xxx',
  `author_id` varchar(64) NOT NULL COMMENT 'author user id',
  `title` varchar(128) NOT NULL COMMENT 'video title',
  `description` varchar(500) NOT NULL DEFAULT '' COMMENT 'video description',
  `play_url` varchar(512) NOT NULL COMMENT 'video play url',
  `cover_url` varchar(512) NOT NULL DEFAULT '' COMMENT 'video cover url',
  `like_count` int NOT NULL DEFAULT 0 COMMENT 'like count',
  `favorite_count` int NOT NULL DEFAULT 0 COMMENT 'favorite count',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE or DELETED',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  `deleted_at` datetime DEFAULT NULL COMMENT 'logical delete time',
  PRIMARY KEY (`id`),
  KEY `idx_video_author_id` (`author_id`),
  KEY `idx_video_recommend_sort` (`status`, `deleted_at`, `like_count`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='video table';

CREATE TABLE `video_view` (
  `id` varchar(64) NOT NULL COMMENT 'view record id, for example view_xxx',
  `user_id` varchar(64) NOT NULL COMMENT 'user id',
  `video_id` varchar(64) NOT NULL COMMENT 'video id',
  `viewed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'view time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_video_view_user_video` (`user_id`, `video_id`),
  KEY `idx_video_view_user_id` (`user_id`),
  KEY `idx_video_view_video_id` (`video_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='video view table';

CREATE TABLE `video_favorite` (
  `id` varchar(64) NOT NULL COMMENT 'favorite record id, for example fav_xxx',
  `user_id` varchar(64) NOT NULL COMMENT 'user id',
  `video_id` varchar(64) NOT NULL COMMENT 'video id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'favorite time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_video_favorite_user_video` (`user_id`, `video_id`),
  KEY `idx_video_favorite_user_id` (`user_id`),
  KEY `idx_video_favorite_video_id` (`video_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='video favorite table';

CREATE TABLE `video_like` (
  `id` varchar(64) NOT NULL COMMENT 'like record id, for example like_xxx',
  `user_id` varchar(64) NOT NULL COMMENT 'user id',
  `video_id` varchar(64) NOT NULL COMMENT 'video id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'like time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_video_like_user_video` (`user_id`, `video_id`),
  KEY `idx_video_like_user_id` (`user_id`),
  KEY `idx_video_like_video_id` (`video_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='video like table';

CREATE TABLE `request_log` (
  `id` varchar(64) NOT NULL COMMENT 'log id, for example log_xxx',
  `request_id` varchar(64) DEFAULT NULL COMMENT 'request id',
  `user_id` varchar(64) DEFAULT NULL COMMENT 'user id',
  `interface_name` varchar(100) NOT NULL COMMENT 'interface or method name',
  `method` varchar(16) DEFAULT NULL COMMENT 'http method',
  `path` varchar(255) DEFAULT NULL COMMENT 'request path',
  `input_data` text COMMENT 'request payload snapshot',
  `output_data` text COMMENT 'response payload snapshot',
  `cost_time` bigint NOT NULL COMMENT 'cost time in ms',
  `is_slow` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'slow request flag',
  `http_status` int DEFAULT NULL COMMENT 'http status code',
  `success` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'success flag',
  `error_code` varchar(64) DEFAULT NULL COMMENT 'business error code',
  `client_ip` varchar(64) DEFAULT NULL COMMENT 'client ip',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  PRIMARY KEY (`id`),
  KEY `idx_request_log_created_at` (`created_at`),
  KEY `idx_request_log_path_method` (`path`, `method`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='request log table';

CREATE TABLE `token_blacklist` (
  `id` varchar(64) NOT NULL COMMENT 'primary key, for example tbl_xxx',
  `token` varchar(1024) NOT NULL COMMENT 'revoked token',
  `user_id` varchar(64) NOT NULL COMMENT 'user id',
  `expire_at` datetime NOT NULL COMMENT 'token expire time',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token_blacklist_token` (`token`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='jwt blacklist table';

SET FOREIGN_KEY_CHECKS = 1;
