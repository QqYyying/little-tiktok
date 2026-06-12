-- =============================================================================
-- Update script for favorite functionality
-- Run this script to add favorite_count column and video_favorite table
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Add favorite_count column to video table if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'video'
      AND COLUMN_NAME = 'favorite_count'
);
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `video` ADD COLUMN `favorite_count` INT NOT NULL DEFAULT 0 COMMENT \'favorite count\' AFTER `like_count`',
    'SELECT \'favorite_count column already exists\' AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create video_favorite table if it doesn't exist
DROP TABLE IF EXISTS `video_favorite`;

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

SET FOREIGN_KEY_CHECKS = 1;
