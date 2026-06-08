# 成员 B 推荐模块技术文档

## 1. 模块范围

成员 B 负责的推荐模块范围如下：

1. 推荐流接口
2. RPC 调用边界
3. 浏览记录上报
4. 已访问去重
5. 点赞排序
6. 前端首页推荐流从 mock 切换为真实接口
7. 点赞 / 取消点赞切换为真实后端接口
8. 浏览上报切换为真实后端接口

当前实现不包含评论系统，不包含媒体资源托管能力，不以收藏模块为核心验收范围。

## 2. 接口清单

成员 B 相关核心接口如下：

1. `GET /api/v1/recommend/feed`
2. `POST /api/v1/videos/{videoId}/view`
3. `POST /api/v1/videos/{videoId}/like`
4. `DELETE /api/v1/videos/{videoId}/like`
5. `GET /api/v1/videos/{videoId}/like/status`

为便于演示与联调，补充了一个只读查询接口：

6. `GET /api/v1/videos/view/history`

说明：

- 统一前缀为 `/api/v1`
- 统一认证方式为 `Authorization: Bearer <token>`
- 响应统一通过后端 `ApiResponse` 包装

## 3. 统一响应结构

所有成员 B 接口统一返回如下结构：

```json
{
  "code": "OK",
  "message": "success",
  "data": {}
}
```

### 3.1 推荐流接口

- 方法：`GET`
- 路径：`/api/v1/recommend/feed`
- 鉴权：需要登录
- Query 参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `count` | int | 否 | 推荐条数，前端默认传 `5` |

成功响应示例：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "items": [
      {
        "videoId": "vid_5005",
        "authorId": "usr_1004",
        "authorName": "david_buaa",
        "title": "北京交通大学明湖夏日美景打卡",
        "description": "",
        "videoUrl": "/tiktok-videos/20260515_bjtu_lake.mp4",
        "coverUrl": "/tiktok-covers/20260515_bjtu_lake.jpg",
        "likeCount": 256,
        "liked": false,
        "createdAt": "2026-05-15T18:25:00"
      }
    ],
    "hasMore": false
  },
  "requestId": "req_xxx"
}
```

业务规则：

1. 只返回 `ACTIVE` 且 `deleted_at IS NULL` 的视频
2. 过滤当前用户已浏览视频
3. 按 `like_count DESC, created_at DESC` 排序
4. 返回字段包含前端展示所需的完整视频信息
5. `liked` 为当前用户维度的点赞状态
6. `hasMore` 为最小可交付实现，当前按 `items.size == count` 计算

### 3.2 浏览上报接口

- 方法：`POST`
- 路径：`/api/v1/videos/{videoId}/view`
- 鉴权：需要登录
- Path 参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `videoId` | string | 是 | 视频 ID |

成功响应示例：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "videoId": "vid_5005",
    "viewed": true
  },
  "requestId": "req_xxx"
}
```

业务规则：

1. 当前用户必须已登录
2. `videoId` 必须存在且可见
3. 重复浏览同一视频不报错
4. 同一用户不同视频可产生多条浏览记录

幂等性说明：

- 通过 `video_view` 表的 `(user_id, video_id)` 唯一约束去重
- SQL 使用 `INSERT IGNORE`

### 3.3 点赞接口

- 方法：`POST`
- 路径：`/api/v1/videos/{videoId}/like`
- 鉴权：需要登录

成功响应示例：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "videoId": "vid_5005",
    "liked": true,
    "likeCount": 16
  },
  "requestId": "req_xxx"
}
```

业务规则：

1. 当前用户必须已登录
2. `videoId` 必须存在且可见
3. 只有首次点赞成功时，`like_count` 才加 1

幂等性说明：

- 通过 `video_like` 表唯一约束去重
- 重复点赞不会重复增加 `likeCount`

### 3.4 取消点赞接口

- 方法：`DELETE`
- 路径：`/api/v1/videos/{videoId}/like`
- 鉴权：需要登录

成功响应示例：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "videoId": "vid_5005",
    "liked": false,
    "likeCount": 15
  },
  "requestId": "req_xxx"
}
```

业务规则：

1. 当前用户必须已登录
2. `videoId` 必须存在且可见
3. 只有原先存在点赞关系时，`like_count` 才减 1
4. `like_count` 不允许为负数

### 3.5 点赞状态查询接口

- 方法：`GET`
- 路径：`/api/v1/videos/{videoId}/like/status`
- 鉴权：需要登录

成功响应示例：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "videoId": "vid_5005",
    "liked": false,
    "likeCount": 15
  },
  "requestId": "req_xxx"
}
```

### 3.6 浏览记录查询接口

- 方法：`GET`
- 路径：`/api/v1/videos/view/history`
- 鉴权：需要登录

说明：

- 该接口用于演示和前端可视化查看浏览记录
- 不属于最初 5 个核心接口，但便于验收

成功响应示例：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "items": [
      {
        "videoId": "vid_5005",
        "authorId": "usr_1004",
        "authorName": "david_buaa",
        "title": "北京交通大学明湖夏日美景打卡",
        "description": "",
        "videoUrl": "/tiktok-videos/20260515_bjtu_lake.mp4",
        "coverUrl": "/tiktok-covers/20260515_bjtu_lake.jpg",
        "likeCount": 256,
        "createdAt": "2026-05-15T18:25:00",
        "viewedAt": "2026-06-08T16:11:04"
      }
    ]
  },
  "requestId": "req_xxx"
}
```

## 4. 后端设计说明

### 4.1 Controller

核心控制器：

- [RecommendationController.java](E:\little-tiktok\backend\src\main\java\com\tiktok\recommend\controller\RecommendationController.java)

职责：

1. 提供推荐流接口
2. 提供浏览上报接口
3. 提供点赞 / 取消点赞 / 点赞状态接口
4. 提供浏览记录查询接口
5. 从 `UserContext` 获取当前用户 ID

### 4.2 RPC 边界

相关文件：

- [RecommendationRpcClient.java](E:\little-tiktok\backend\src\main\java\com\tiktok\recommend\rpc\RecommendationRpcClient.java)
- [LocalRecommendationRpcClient.java](E:\little-tiktok\backend\src\main\java\com\tiktok\recommend\rpc\LocalRecommendationRpcClient.java)

设计说明：

1. Controller 不直接调用 `RecommendationService`
2. Controller 通过 `RecommendationRpcClient` 访问推荐能力
3. 当前使用 `LocalRecommendationRpcClient` 作为本地 RPC 模拟实现
4. 后续可替换为真实 gRPC / Dubbo Client

答辩可用解释：

“当前实现已经保留了明确 RPC 边界，主端并不直接依赖推荐 Service，而是通过 `RecommendationRpcClient` 调用推荐能力。当前为了课程交付复杂度可控，采用本地 Bean 方式模拟 RPC，后续只需替换 `LocalRecommendationRpcClient` 即可接入真实 RPC 框架。”

### 4.3 Service

核心服务：

- [RecommendationService.java](E:\little-tiktok\backend\src\main\java\com\tiktok\recommend\service\RecommendationService.java)
- [LikeService.java](E:\little-tiktok\backend\src\main\java\com\tiktok\like\service\LikeService.java)
- [ViewService.java](E:\little-tiktok\backend\src\main\java\com\tiktok\view\service\ViewService.java)

说明：

- `RecommendationService`
  - 归一化 `count`
  - 查询推荐视频列表
  - 转换为推荐 DTO
  - 填充 `liked`

- `LikeService`
  - 校验视频可见性
  - 首次点赞才增加 `like_count`
  - 删除成功才减少 `like_count`
  - 全流程事务保护

- `ViewService`
  - 校验视频可见性
  - 浏览写入 `video_view`
  - 提供浏览记录列表查询
  - 浏览写入为事务方法

### 4.4 Mapper 与 SQL

核心文件：

- [VideoMapper.java](E:\little-tiktok\backend\src\main\java\com\tiktok\video\mapper\VideoMapper.java)
- [VideoMapper.xml](E:\little-tiktok\backend\src\main\resources\mapper\VideoMapper.xml)
- [LikeMapper.java](E:\little-tiktok\backend\src\main\java\com\tiktok\like\mapper\LikeMapper.java)
- [LikeMapper.xml](E:\little-tiktok\backend\src\main\resources\mapper\LikeMapper.xml)
- [ViewMapper.java](E:\little-tiktok\backend\src\main\java\com\tiktok\view\mapper\ViewMapper.java)
- [ViewMapper.xml](E:\little-tiktok\backend\src\main\resources\mapper\ViewMapper.xml)

SQL 关键点：

1. 推荐流通过 `video_view` 过滤已访问视频
2. 推荐流按 `v.like_count DESC, v.created_at DESC` 排序
3. 浏览上报与点赞都使用 `INSERT IGNORE`
4. `video_view` / `video_like` 插入时显式写入 `id`
5. `like_count` 减少时通过 SQL 保证不小于 0

## 5. 前端设计说明

### 5.1 相关文件

- [index.ts](E:\little-tiktok\frontend\src\api\index.ts)
- [recommend.ts](E:\little-tiktok\frontend\src\services\recommend.ts)
- [like.ts](E:\little-tiktok\frontend\src\services\like.ts)
- [video.ts](E:\little-tiktok\frontend\src\services\video.ts)
- [useVideoFeed.ts](E:\little-tiktok\frontend\src\hooks\useVideoFeed.ts)
- [VideoFeed.tsx](E:\little-tiktok\frontend\src\components\video\VideoFeed.tsx)
- [VideoCard.tsx](E:\little-tiktok\frontend\src\components\video\VideoCard.tsx)
- [ViewHistoryList.tsx](E:\little-tiktok\frontend\src\components\my-videos\ViewHistoryList.tsx)

### 5.2 首页推荐流

当前首页已不再使用 mock 数据，而是调用真实接口：

- `GET /api/v1/recommend/feed?count=5`

前端行为：

1. 首屏加载推荐流
2. 正确解析 `response.data.items` 与 `response.data.hasMore`
3. `video.videoUrl` 用于视频播放
4. `video.coverUrl` 用于封面
5. `video.liked` 与 `video.likeCount` 用于点赞状态展示

### 5.3 浏览上报

浏览上报服务：

- `POST /api/v1/videos/{videoId}/view`

触发方式：

1. 当前视频变化时自动上报
2. 同一会话内通过 `Set` 去重，避免重复上报同一视频
3. 只有上报成功后才写入“已上报集合”，避免失败后永不重试

### 5.4 视频切换交互

为保证 `currentIndex` 能真实变化，已补充以下交互：

1. 上下按钮切换
2. 鼠标滚轮切换
3. 键盘 `ArrowDown` / `ArrowUp`
4. 触摸滑动切换

说明：

- 这些交互只改变 `currentIndex`
- 浏览上报仍由 `currentIndex` 变化统一触发

### 5.5 浏览记录可视化

为了便于验收与展示，已补充前端浏览记录页面：

- 页面入口：`/my-videos`
- 第三个标签：`浏览记录`
- 接口：`GET /api/v1/videos/view/history`

说明：

- 原始项目没有“浏览记录展示页”
- 当前已补充一个最小可用组件用于展示用户已浏览视频列表

## 6. 鉴权说明

认证方式：

- Header：`Authorization: Bearer <token>`

前端 token 来源：

- `localStorage.getItem('token')`

后端 userId 来源：

- `UserContext.getCurrentUserId()`

安全性说明：

1. 成员 B 接口不依赖前端传 `userId`
2. 点赞、浏览、推荐流都要求登录态
3. 匿名用户请求会返回未授权错误

## 7. 幂等性说明

### 7.1 浏览记录幂等

浏览记录表：

- `video_view`
- 唯一约束：`(user_id, video_id)`

幂等方式：

1. 数据库层使用唯一约束
2. SQL 使用 `INSERT IGNORE`
3. 前端会话内再额外用 `Set` 减少重复上报

结论：

- 重复浏览同一视频不会插入多条记录
- 不同视频会产生多条记录

### 7.2 点赞幂等

点赞关系表：

- `video_like`
- 唯一约束：`(user_id, video_id)`

幂等方式：

1. 点赞使用 `INSERT IGNORE`
2. 仅插入成功才增加 `like_count`
3. 仅删除成功才减少 `like_count`

结论：

- 重复点赞不会重复加 1
- 重复取消点赞不会继续减 1
- `like_count` 不会为负

## 8. 测试结论

已完成的核心验证：

1. 推荐流真实接口联调
2. 点赞 / 取消点赞真实接口联调
3. 浏览上报真实接口联调
4. 已访问去重验证
5. 点赞排序验证
6. 浏览记录查询接口验证
7. 浏览记录前端列表可视化接入

关键结论：

1. 推荐流只返回可见未删除视频
2. 浏览后重新请求推荐流，已访问视频会被过滤
3. 点赞状态与数量以后端返回为准
4. 浏览记录与点赞均具备幂等性
5. 前后端真实联调已完成

## 9. 已知问题与范围判断

### 9.1 非核心问题

媒体资源路径当前可能返回相对地址，例如：

- `/tiktok-videos/xxx.mp4`
- `/tiktok-covers/xxx.jpg`

在前端 `localhost:3000` 下访问时可能出现 `404`。

范围判断：

1. 这不影响推荐、点赞、浏览上报主链路
2. 更偏向静态资源映射 / 测试数据 / 文件服务问题
3. 不属于成员 B 推荐模块核心接口逻辑

### 9.2 当前实现限制

1. `hasMore` 为最小可交付实现
2. 收藏仍是本地状态，不属于成员 B 验收核心
3. `count=0` 当前会被参数校验拦截，不会回退为默认 5

## 10. Apifox 导入说明

本地 Swagger / OpenAPI 地址：

- Swagger UI：`http://localhost:8080/swagger-ui.html`
- OpenAPI JSON：`http://localhost:8080/v3/api-docs`

Apifox 导入方式：

1. 导入 OpenAPI / Swagger
2. 选择 URL 导入
3. 输入 `http://localhost:8080/v3/api-docs`

建议接口分组：

- 成员 B - 推荐模块

推荐保留的核心接口：

1. `GET /api/v1/recommend/feed`
2. `POST /api/v1/videos/{videoId}/view`
3. `POST /api/v1/videos/{videoId}/like`
4. `DELETE /api/v1/videos/{videoId}/like`
5. `GET /api/v1/videos/{videoId}/like/status`

可选补充：

6. `GET /api/v1/videos/view/history`

## 11. 答辩总结话术

“成员 B 负责的推荐模块已经完成端到端交付。后端通过 RecommendationRpcClient 建立了明确的 RPC 边界，Controller 不直接依赖推荐 Service；推荐流基于浏览记录表实现已访问去重，基于 `like_count` 实现点赞排序；点赞与浏览上报都通过唯一约束和 `INSERT IGNORE` 实现幂等；前端首页已经从 mock 切换为真实后端接口，并完成了推荐流、点赞、取消点赞、浏览上报和浏览记录展示的真实联调。当前剩余的媒体资源 404 问题属于展示资源映射问题，不影响成员 B 核心业务链路验收。”
