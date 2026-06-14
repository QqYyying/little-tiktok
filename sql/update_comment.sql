-- 添加评论表
CREATE TABLE IF NOT EXISTS `video_comment` (
  `id` varchar(64) NOT NULL COMMENT 'comment id, for example cmt_xxx',
  `video_id` varchar(64) NOT NULL COMMENT 'video id',
  `user_id` varchar(64) NOT NULL COMMENT 'user id',
  `content` varchar(500) NOT NULL COMMENT 'comment content',
  `like_count` int NOT NULL DEFAULT 0 COMMENT 'like count',
  `reply_to_id` varchar(64) DEFAULT NULL COMMENT 'reply to comment id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'updated time',
  PRIMARY KEY (`id`),
  KEY `idx_comment_video_id` (`video_id`),
  KEY `idx_comment_user_id` (`user_id`),
  KEY `idx_comment_reply_to_id` (`reply_to_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='video comment table';

-- 更新video表添加评论数字段
ALTER TABLE `video` ADD COLUMN IF NOT EXISTS `comment_count` int NOT NULL DEFAULT 0 COMMENT 'comment count' AFTER `favorite_count`;