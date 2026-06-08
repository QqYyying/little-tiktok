-- =============================================================================
-- MiniTikTok current seed data v3 (DML)
-- Default test password for all accounts: 123456
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `user` (`id`, `username`, `password_hash`, `status`, `role`, `created_at`, `updated_at`) VALUES
('usr_1001', 'alex_coder', '$2a$10$m38NCjCd91lGqo02p6xTC.Nq4CFdHFZSXJlM9TxhSsYEZLbV1Ywtq', 'ACTIVE', 'USER', '2026-05-01 10:00:00', '2026-05-01 10:00:00'),
('usr_1002', 'bob_tech',   '$2a$10$m38NCjCd91lGqo02p6xTC.Nq4CFdHFZSXJlM9TxhSsYEZLbV1Ywtq', 'ACTIVE', 'USER', '2026-05-02 11:15:00', '2026-05-02 11:15:00'),
('usr_1003', 'charlie_v',  '$2a$10$m38NCjCd91lGqo02p6xTC.Nq4CFdHFZSXJlM9TxhSsYEZLbV1Ywtq', 'ACTIVE', 'USER', '2026-05-03 14:20:00', '2026-05-03 14:20:00'),
('usr_1004', 'david_buaa', '$2a$10$m38NCjCd91lGqo02p6xTC.Nq4CFdHFZSXJlM9TxhSsYEZLbV1Ywtq', 'ACTIVE', 'ADMIN', '2026-05-04 09:05:00', '2026-05-04 09:05:00'),
('usr_1005', 'eva_star',   '$2a$10$m38NCjCd91lGqo02p6xTC.Nq4CFdHFZSXJlM9TxhSsYEZLbV1Ywtq', 'BANNED', 'USER', '2026-05-05 16:40:00', '2026-05-05 16:40:00');

INSERT INTO `video` (`id`, `author_id`, `title`, `description`, `play_url`, `cover_url`, `like_count`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
('vid_5001', 'usr_1001', 'My first Rust kernel build passed', 'Rust OS build process record', '/tiktok-videos/20260521_rust_os.mp4', '/tiktok-covers/20260521_rust_os.jpg', 1, 'ACTIVE', '2026-05-10 08:00:00', '2026-05-10 08:00:00', NULL),
('vid_5002', 'usr_1001', 'QEMU RISC-V demo', 'QEMU and RISC-V runtime demo', '/tiktok-videos/20260511_qemu_riscv.mp4', '/tiktok-covers/20260511_qemu_riscv.jpg', 0, 'ACTIVE', '2026-05-11 09:30:00', '2026-05-11 09:30:00', NULL),
('vid_5003', 'usr_1002', 'Spring Boot graceful shutdown practice', 'Backend graceful shutdown example', '/tiktok-videos/20260512_springboot.mp4', '/tiktok-covers/20260512_springboot.jpg', 2, 'ACTIVE', '2026-05-12 21:00:00', '2026-05-12 21:00:00', NULL),
('vid_5004', 'usr_1003', 'Flutter smooth scroll component', 'Mobile scrolling interaction example', '/tiktok-videos/20260514_flutter_scroll.mp4', '/tiktok-covers/20260514_flutter_scroll.jpg', 0, 'ACTIVE', '2026-05-14 15:00:00', '2026-05-14 15:00:00', NULL),
('vid_5005', 'usr_1004', 'BJTU Minghu summer view', 'Campus scenery sample video', '/tiktok-videos/20260515_bjtu_lake.mp4', '/tiktok-covers/20260515_bjtu_lake.jpg', 3, 'ACTIVE', '2026-05-15 18:25:00', '2026-05-15 18:25:00', NULL),
('vid_5006', 'usr_1002', 'Deleted test video', 'Deleted video example', '/tiktok-videos/20260516_test_bad.mp4', '/tiktok-covers/20260516_test_bad.jpg', 0, 'DELETED', '2026-05-16 10:00:00', '2026-05-16 10:00:00', '2026-05-16 12:00:00');

INSERT INTO `video_like` (`id`, `user_id`, `video_id`, `created_at`) VALUES
('like_9001', 'usr_1001', 'vid_5005', '2026-05-15 19:00:00'),
('like_9002', 'usr_1002', 'vid_5005', '2026-05-15 19:05:00'),
('like_9003', 'usr_1003', 'vid_5005', '2026-05-15 19:10:00'),
('like_9004', 'usr_1001', 'vid_5003', '2026-05-13 08:22:00'),
('like_9005', 'usr_1004', 'vid_5003', '2026-05-13 09:14:00'),
('like_9006', 'usr_1002', 'vid_5001', '2026-05-10 12:00:00');

INSERT INTO `video_view` (`id`, `user_id`, `video_id`, `viewed_at`) VALUES
('view_8001', 'usr_1001', 'vid_5001', '2026-05-11 10:00:00'),
('view_8002', 'usr_1001', 'vid_5003', '2026-05-13 08:21:00'),
('view_8003', 'usr_1002', 'vid_5003', '2026-05-14 11:00:00');

INSERT INTO `request_log` (
  `id`, `request_id`, `user_id`, `interface_name`, `method`, `path`,
  `input_data`, `output_data`, `cost_time`, `is_slow`, `http_status`,
  `success`, `error_code`, `client_ip`, `created_at`
) VALUES
('log_7001', 'req_7001', 'usr_1001', 'AuthController.login', 'POST', '/api/v1/auth/login',
 '{"username":"alex_coder"}',
 '{"code":"0","message":"success"}',
 45, 0, 200, 1, NULL, '127.0.0.1', '2026-05-21 00:05:12'),
('log_7002', 'req_7002', 'usr_1001', 'RecommendationController.getRecommendFeed', 'GET', '/api/v1/recommend/feed',
 '{"count":5}',
 '{"code":"0","message":"success"}',
 18, 0, 200, 1, NULL, '127.0.0.1', '2026-05-21 00:06:01'),
('log_7003', 'req_7003', 'usr_1001', 'VideoController.deleteVideo', 'DELETE', '/api/v1/videos/vid_5001',
 '{"videoId":"vid_5001"}',
 '{"code":"0","message":"success"}',
 120, 1, 200, 1, NULL, '127.0.0.1', '2026-05-21 00:10:45');

SET FOREIGN_KEY_CHECKS = 1;
