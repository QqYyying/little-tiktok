-- Member B video module minimal migration
-- Compatible with older MySQL versions that do not support
-- "ADD COLUMN IF NOT EXISTS".
-- Safe to run multiple times.

SET NAMES utf8mb4;

SET @db = DATABASE();

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'user'
          AND COLUMN_NAME = 'role'
    ),
    'SELECT 1',
    'ALTER TABLE `user` ADD COLUMN `role` varchar(32) NOT NULL DEFAULT ''USER'' COMMENT ''user role'' AFTER `status`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'user'
          AND COLUMN_NAME = 'updated_at'
    ),
    'SELECT 1',
    'ALTER TABLE `user` ADD COLUMN `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT ''updated time'' AFTER `created_at`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'video'
          AND COLUMN_NAME = 'description'
    ),
    'SELECT 1',
    'ALTER TABLE `video` ADD COLUMN `description` varchar(500) NOT NULL DEFAULT '''' COMMENT ''video description'' AFTER `title`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'video'
          AND COLUMN_NAME = 'updated_at'
    ),
    'SELECT 1',
    'ALTER TABLE `video` ADD COLUMN `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT ''updated time'' AFTER `created_at`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'video'
          AND COLUMN_NAME = 'deleted_at'
    ),
    'SELECT 1',
    'ALTER TABLE `video` ADD COLUMN `deleted_at` datetime NULL DEFAULT NULL COMMENT ''logical delete time'' AFTER `updated_at`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'request_log'
          AND COLUMN_NAME = 'request_id'
    ),
    'SELECT 1',
    'ALTER TABLE `request_log` ADD COLUMN `request_id` varchar(64) NULL COMMENT ''request id'' AFTER `id`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'request_log'
          AND COLUMN_NAME = 'method'
    ),
    'SELECT 1',
    'ALTER TABLE `request_log` ADD COLUMN `method` varchar(16) NULL COMMENT ''http method'' AFTER `interface_name`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'request_log'
          AND COLUMN_NAME = 'path'
    ),
    'SELECT 1',
    'ALTER TABLE `request_log` ADD COLUMN `path` varchar(255) NULL COMMENT ''request path'' AFTER `method`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'request_log'
          AND COLUMN_NAME = 'is_slow'
    ),
    'SELECT 1',
    'ALTER TABLE `request_log` ADD COLUMN `is_slow` tinyint(1) NOT NULL DEFAULT 0 COMMENT ''slow request flag'' AFTER `cost_time`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'request_log'
          AND COLUMN_NAME = 'http_status'
    ),
    'SELECT 1',
    'ALTER TABLE `request_log` ADD COLUMN `http_status` int NULL COMMENT ''http status'' AFTER `is_slow`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'request_log'
          AND COLUMN_NAME = 'success'
    ),
    'SELECT 1',
    'ALTER TABLE `request_log` ADD COLUMN `success` tinyint(1) NOT NULL DEFAULT 1 COMMENT ''success flag'' AFTER `http_status`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'request_log'
          AND COLUMN_NAME = 'error_code'
    ),
    'SELECT 1',
    'ALTER TABLE `request_log` ADD COLUMN `error_code` varchar(64) NULL COMMENT ''error code'' AFTER `success`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @db
          AND TABLE_NAME = 'request_log'
          AND COLUMN_NAME = 'client_ip'
    ),
    'SELECT 1',
    'ALTER TABLE `request_log` ADD COLUMN `client_ip` varchar(64) NULL COMMENT ''client ip'' AFTER `error_code`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS `token_blacklist` (
    `id` varchar(64) NOT NULL COMMENT 'primary key',
    `token` varchar(1024) NOT NULL COMMENT 'revoked token',
    `user_id` varchar(64) NOT NULL COMMENT 'user id',
    `expire_at` datetime NOT NULL COMMENT 'token expire time',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'created time',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_token_blacklist_token` (`token`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='jwt blacklist';
