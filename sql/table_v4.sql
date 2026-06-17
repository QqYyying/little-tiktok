-- =============================================================================
-- MiniTikTok schema v4 (DDL)
-- Covers auth, video management, recommendation, likes, favorites, comments,
-- request logging, and admin monitoring used by the current backend.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `token_blacklist`;
DROP TABLE IF EXISTS `request_log`;
DROP TABLE IF EXISTS `video_comment`;
DROP TABLE IF EXISTS `video_favorite`;
DROP TABLE IF EXISTS `video_like`;
DROP TABLE IF EXISTS `video_view`;
DROP TABLE IF EXISTS `video`;
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` varchar(64) NOT NULL COMMENT 'user id, for example usr_xxx',
  `username` varchar(32) NOT NULL COMMENT 'unique login username',
  `password_hash` varchar(100) NOT NULL COMMENT 'bcrypt password hash',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE or BANNED',
  `role` varchar(32) NOT NULL DEFAULT 'USER' COMMENT 'USER or ADMIN',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`),
  KEY `idx_user_status_role` (`status`, `role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='user table';

CREATE TABLE `video` (
  `id` varchar(64) NOT NULL COMMENT 'video id, for example vid_xxx',
  `author_id` varchar(64) NOT NULL COMMENT 'author user id',
  `title` varchar(128) NOT NULL COMMENT 'video title',
  `description` varchar(500) NOT NULL DEFAULT '' COMMENT 'video description',
  `play_url` varchar(512) NOT NULL COMMENT 'video play url or object storage url',
  `cover_url` varchar(512) NOT NULL DEFAULT '' COMMENT 'video cover url',
  `like_count` int NOT NULL DEFAULT 0 COMMENT 'denormalized like count',
  `favorite_count` int NOT NULL DEFAULT 0 COMMENT 'denormalized favorite count',
  `comment_count` int NOT NULL DEFAULT 0 COMMENT 'denormalized comment count',
  `status` varchar(16) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE or DELETED',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  `deleted_at` datetime DEFAULT NULL COMMENT 'logical delete time',
  PRIMARY KEY (`id`),
  KEY `idx_video_author_id` (`author_id`, `status`, `created_at`),
  KEY `idx_video_recommend_sort` (`status`, `deleted_at`, `like_count`, `created_at`),
  CONSTRAINT `fk_video_author` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='video table';

CREATE TABLE `video_view` (
  `id` varchar(64) NOT NULL COMMENT 'view record id, for example view_xxx',
  `user_id` varchar(64) NOT NULL COMMENT 'viewer user id',
  `video_id` varchar(64) NOT NULL COMMENT 'viewed video id',
  `viewed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'view time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_video_view_user_video` (`user_id`, `video_id`),
  KEY `idx_video_view_user_time` (`user_id`, `viewed_at`),
  KEY `idx_video_view_video_id` (`video_id`),
  CONSTRAINT `fk_video_view_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_video_view_video` FOREIGN KEY (`video_id`) REFERENCES `video` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='video view table';

CREATE TABLE `video_like` (
  `id` varchar(64) NOT NULL COMMENT 'like record id, for example like_xxx',
  `user_id` varchar(64) NOT NULL COMMENT 'user id',
  `video_id` varchar(64) NOT NULL COMMENT 'video id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'like time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_video_like_user_video` (`user_id`, `video_id`),
  KEY `idx_video_like_user_time` (`user_id`, `created_at`),
  KEY `idx_video_like_video_id` (`video_id`),
  CONSTRAINT `fk_video_like_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_video_like_video` FOREIGN KEY (`video_id`) REFERENCES `video` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='video like table';

CREATE TABLE `video_favorite` (
  `id` varchar(64) NOT NULL COMMENT 'favorite record id, for example fav_xxx',
  `user_id` varchar(64) NOT NULL COMMENT 'user id',
  `video_id` varchar(64) NOT NULL COMMENT 'video id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'favorite time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_video_favorite_user_video` (`user_id`, `video_id`),
  KEY `idx_video_favorite_user_time` (`user_id`, `created_at`),
  KEY `idx_video_favorite_video_id` (`video_id`),
  CONSTRAINT `fk_video_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_video_favorite_video` FOREIGN KEY (`video_id`) REFERENCES `video` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='video favorite table';

CREATE TABLE `video_comment` (
  `id` varchar(64) NOT NULL COMMENT 'comment id, for example cmt_xxx',
  `video_id` varchar(64) NOT NULL COMMENT 'video id',
  `user_id` varchar(64) NOT NULL COMMENT 'comment author user id',
  `content` varchar(500) NOT NULL COMMENT 'comment content',
  `like_count` int NOT NULL DEFAULT 0 COMMENT 'comment like count',
  `reply_to_id` varchar(64) DEFAULT NULL COMMENT 'reply target comment id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  KEY `idx_video_comment_video_time` (`video_id`, `created_at`),
  KEY `idx_video_comment_user_id` (`user_id`),
  KEY `idx_video_comment_reply_to_id` (`reply_to_id`),
  CONSTRAINT `fk_video_comment_video` FOREIGN KEY (`video_id`) REFERENCES `video` (`id`),
  CONSTRAINT `fk_video_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_video_comment_reply` FOREIGN KEY (`reply_to_id`) REFERENCES `video_comment` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='video comment table';

CREATE TABLE `request_log` (
  `id` varchar(64) NOT NULL COMMENT 'log id, for example log_xxx',
  `request_id` varchar(64) DEFAULT NULL COMMENT 'request trace id',
  `user_id` varchar(64) DEFAULT NULL COMMENT 'request user id, null for anonymous/login failures',
  `interface_name` varchar(100) NOT NULL COMMENT 'controller or handler method name',
  `method` varchar(16) DEFAULT NULL COMMENT 'HTTP method',
  `path` varchar(255) DEFAULT NULL COMMENT 'request path',
  `input_data` text COMMENT 'masked request params/body snapshot',
  `output_data` text COMMENT 'masked response/error snapshot',
  `cost_time` bigint NOT NULL COMMENT 'cost time in ms',
  `is_slow` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'slow request flag',
  `http_status` int DEFAULT NULL COMMENT 'HTTP status code',
  `success` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'success flag',
  `error_code` varchar(64) DEFAULT NULL COMMENT 'business error code',
  `client_ip` varchar(64) DEFAULT NULL COMMENT 'client ip',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  PRIMARY KEY (`id`),
  KEY `idx_request_log_created_at` (`created_at`),
  KEY `idx_request_log_user_time` (`user_id`, `created_at`),
  KEY `idx_request_log_request_id` (`request_id`),
  KEY `idx_request_log_path_method` (`path`, `method`),
  KEY `idx_request_log_slow_success` (`is_slow`, `success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='request log table';

CREATE TABLE `token_blacklist` (
  `id` varchar(64) NOT NULL COMMENT 'primary key, for example tbl_xxx',
  `token` varchar(1024) NOT NULL COMMENT 'revoked JWT token',
  `user_id` varchar(64) NOT NULL COMMENT 'user id',
  `expire_at` datetime NOT NULL COMMENT 'token expire time',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token_blacklist_token` (`token`(255)),
  KEY `idx_token_blacklist_user_id` (`user_id`),
  KEY `idx_token_blacklist_expire_at` (`expire_at`),
  CONSTRAINT `fk_token_blacklist_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='JWT blacklist table';

SET FOREIGN_KEY_CHECKS = 1;
