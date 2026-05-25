-- =============================================================================
-- MiniTikTok 种子数据导入 (DML)
-- 说明：测试用户的初始化明文密码统一为 123456
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 导入初始测试用户 (密码采用标准 BCrypt 哈希密文)
INSERT INTO `user` (`id`, `username`, `password_hash`, `status`, `created_at`) VALUES
(1001, 'alex_coder', '$2a$10$m38NCjCd91lGqo02p6xTC.Nq4CFdHFZSXJlM9TxhSsYEZLbV1Ywtq', 'ACTIVE', '2026-05-01 10:00:00'),
(1002, 'bob_tech',   '$2a$10$m38NCjCd91lGqo02p6xTC.Nq4CFdHFZSXJlM9TxhSsYEZLbV1Ywtq', 'ACTIVE', '2026-05-02 11:15:00'),
(1003, 'charlie_v',  '$2a$10$m38NCjCd91lGqo02p6xTC.Nq4CFdHFZSXJlM9TxhSsYEZLbV1Ywtq', 'ACTIVE', '2026-05-03 14:20:00'),
(1004, 'david_buaa', '$2a$10$m38NCjCd91lGqo02p6xTC.Nq4CFdHFZSXJlM9TxhSsYEZLbV1Ywtq', 'ACTIVE', '2026-05-04 09:05:00'),
(1005, 'eva_star',   '$2a$10$m38NCjCd91lGqo02p6xTC.Nq4CFdHFZSXJlM9TxhSsYEZLbV1Ywtq', 'BANNED', '2026-05-05 16:40:00');

-- 2. 导入初始视频元数据 (规范化模拟 MinIO 的存储路径 Key)
INSERT INTO `video` (`id`, `author_id`, `title`, `play_url`, `cover_url`, `like_count`, `status`, `created_at`) VALUES
(5001, 1001, '我的第一个Rust内核编译成功！', '/tiktok-videos/20260521_rust_os.mp4', '/tiktok-covers/20260521_rust_os.jpg', 42, 'ACTIVE', '2026-05-10 08:00:00'),
(5002, 1001, 'QEMU 模拟 RISC-V 运行演示', '/tiktok-videos/20260511_qemu_riscv.mp4', '/tiktok-covers/20260511_qemu_riscv.jpg', 15, 'ACTIVE', '2026-05-11 09:30:00'),
(5003, 1002, 'Spring Boot 3.x 优雅停机生产实践', '/tiktok-videos/20260512_springboot.mp4', '/tiktok-covers/20260512_springboot.jpg', 128, 'ACTIVE', '2026-05-12 21:00:00'),
(5004, 1003, 'Flutter 丝滑滑动大作业组件封装教程', '/tiktok-videos/20260514_flutter_scroll.mp4', '/tiktok-covers/20260514_flutter_scroll.jpg', 89, 'ACTIVE', '2026-05-14 15:00:00'),
(5005, 1004, '北京交通大学明湖夏日美景打卡', '/tiktok-videos/20260515_bjtu_lake.mp4', '/tiktok-covers/20260515_bjtu_lake.jpg', 256, 'ACTIVE', '2026-05-15 18:25:00'),
(5006, 1002, '测试被下架的违规视频演示', '/tiktok-videos/20260516_test_bad.mp4', '/tiktok-covers/20260516_test_bad.jpg', 3, 'DELETED', '2026-05-16 10:00:00');

-- 3. 导入初始点赞关系
INSERT INTO `video_like` (`user_id`, `video_id`, `created_at`) VALUES
(1001, 5005, '2026-05-15 19:00:00'),
(1002, 5005, '2026-05-15 19:05:00'),
(1003, 5005, '2026-05-15 19:10:00'),
(1001, 5003, '2026-05-13 08:22:00'),
(1004, 5003, '2026-05-13 09:14:00'),
(1002, 5001, '2026-05-10 12:00:00');

-- 4. 导入初始浏览历史
INSERT INTO `video_view` (`user_id`, `video_id`, `viewed_at`) VALUES
(1001, 5001, '2026-05-11 10:00:00'), 
(1001, 5003, '2026-05-13 08:21:00'), 
(1002, 5003, '2026-05-14 11:00:00'); 

-- 5. 导入初始审计日志快照
INSERT INTO `request_log` (`user_id`, `interface_name`, `input_data`, `output_data`, `cost_time`, `created_at`) VALUES
(1001, 'UserController.login', '{"username":"alex_coder"}', '{"code":200,"message":"success","data":{"token":"eyJhbGciOi..."}}', 45, '2026-05-21 00:05:12'),
(NULL, 'VideoController.feed', '{"latest_time":1779292800}', '{"code":200,"video_list":[{"id":5005},{"id":5003}]}', 18, '2026-05-21 00:06:01'),
(1001, 'VideoController.deleteVideo', '{"video_id":5001}', '{"code":200,"message":"视频删除成功"}', 120, '2026-05-21 00:10:45');

SET FOREIGN_KEY_CHECKS = 1;