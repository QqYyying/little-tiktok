SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. user 表增强：增加角色和更新时间
ALTER TABLE `user`
ADD COLUMN `role` varchar(16) NOT NULL DEFAULT 'USER' COMMENT '用户角色：USER-普通用户，ADMIN-管理员'
AFTER `status`;

ALTER TABLE `user`
ADD COLUMN `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
AFTER `created_at`;

-- 2. JWT Token 黑名单表：支持退出登录后 Token 主动失效
DROP TABLE IF EXISTS `token_blacklist`;
CREATE TABLE `token_blacklist` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `token` varchar(512) NOT NULL COMMENT '已失效的JWT Token',
  `user_id` bigint(20) NOT NULL COMMENT '退出登录用户ID',
  `expire_at` datetime NOT NULL COMMENT 'Token原本过期时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入黑名单时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expire_at` (`expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='JWT Token黑名单表';

-- 3. request_log 表增强：支持链路追踪、状态码、错误码、IP、成功失败标记
ALTER TABLE `request_log`
ADD COLUMN `request_id` varchar(64) DEFAULT NULL COMMENT '请求追踪ID' AFTER `id`,
ADD COLUMN `method` varchar(16) DEFAULT NULL COMMENT 'HTTP方法' AFTER `interface_name`,
ADD COLUMN `path` varchar(255) DEFAULT NULL COMMENT '请求路径' AFTER `method`,
ADD COLUMN `http_status` int DEFAULT NULL COMMENT 'HTTP状态码' AFTER `cost_time`,
ADD COLUMN `success` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否成功：1-成功，0-失败' AFTER `http_status`,
ADD COLUMN `error_code` varchar(64) DEFAULT NULL COMMENT '统一错误码' AFTER `success`,
ADD COLUMN `client_ip` varchar(64) DEFAULT NULL COMMENT '客户端IP地址' AFTER `error_code`;

ALTER TABLE `request_log`
ADD KEY `idx_request_id` (`request_id`),
ADD KEY `idx_path_created_at` (`path`, `created_at`);

-- 4. 初始化管理员用户，密码是 123456 的 BCrypt 密文
INSERT INTO `user` (`id`, `username`, `password_hash`, `status`, `role`, `created_at`) VALUES
(1006, 'admin', '$2a$10$m38NCjCd91lGqo02p6xTC.Nq4CFdHFZSXJlM9TxhSsYEZLbV1Ywtq', 'ACTIVE', 'ADMIN', '2026-05-21 10:00:00');

SET FOREIGN_KEY_CHECKS = 1;