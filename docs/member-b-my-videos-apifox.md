# 我的视频管理

说明：
- 认证方式：`Authorization: Bearer <token>`
- 统一响应：后端会包装为 `ApiResponse`
- 当前后端沿用仓库已有 `/api/v1` 前缀
- 当前视频状态沿用仓库已有值：`ACTIVE` / `DELETED`
- 当前数据库字段沿用仓库已有 `play_url`，但对外响应字段统一为 `videoUrl`

## 1. 发布视频

- 接口名称：发布视频（本地文件上传）
- 请求方法：`POST`
- 请求路径：`/api/v1/videos`
- Content-Type：`multipart/form-data`
- 是否分页：否
- 是否记录日志：是
- 权限说明：需要登录

表单字段：

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `file` | file | 是 | 视频文件，支持 `mp4/mov/avi/webm` |
| `title` | string | 是 | 视频标题，最长 128 |
| `description` | string | 否 | 视频描述，最长 500 |
| `coverFile` | file | 否 | 封面图片，支持 `jpg/jpeg/png/webp` |
| `coverUrl` | string | 否 | 外部封面地址 |

成功响应示例：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "videoId": "vid_1234567890",
    "authorId": "usr_1234567890",
    "authorName": "alice",
    "title": "我的视频",
    "description": "视频描述",
    "videoUrl": "/uploads/videos/4ec0d6f0c8a445fb91d9fd9446dcf257.mp4",
    "coverUrl": "/uploads/covers/9fe9bf3c6eb64c12be8a20917c8d3e2d.jpg",
    "likeCount": 0,
    "status": "ACTIVE",
    "createdAt": "2026-06-07T13:28:15",
    "updatedAt": "2026-06-07T13:28:15"
  },
  "requestId": "req_xxx"
}
```

失败响应示例：

```json
{
  "code": "INVALID_ARGUMENT",
  "message": "视频文件不能为空",
  "data": null,
  "requestId": "req_xxx"
}
```

备注：
- 视频文件保存到后端本地 `uploads/videos/`
- 封面文件保存到后端本地 `uploads/covers/`
- 仅做逻辑删除，不自动删除本地文件

## 2. 发布视频（JSON 兼容模式）

- 接口名称：发布视频（直接提交地址）
- 请求方法：`POST`
- 请求路径：`/api/v1/videos`
- Content-Type：`application/json`
- 是否分页：否
- 是否记录日志：是
- 权限说明：需要登录

请求体示例：

```json
{
  "title": "远程视频",
  "description": "兼容提交",
  "videoUrl": "https://example.com/demo.mp4",
  "coverUrl": "https://example.com/demo.jpg"
}
```

## 3. 分页查看我的视频

- 接口名称：分页查看我的视频
- 请求方法：`GET`
- 请求路径：`/api/v1/users/me/videos`
- 是否分页：是
- 是否记录日志：是
- 权限说明：需要登录

Query 参数：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | int | 否 | 默认 1 |
| `pageSize` | int | 否 | 默认 10，最大 50 |
| `keyword` | string | 否 | 匹配标题或描述 |

成功响应示例：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "total": 2,
    "page": 1,
    "pageSize": 10,
    "records": [
      {
        "videoId": "vid_1",
        "authorId": "usr_1",
        "authorName": "alice",
        "title": "我的视频",
        "description": "视频描述",
        "videoUrl": "/uploads/videos/demo.mp4",
        "coverUrl": "/uploads/covers/demo.jpg",
        "likeCount": 0,
        "status": "ACTIVE",
        "createdAt": "2026-06-07T13:28:15",
        "updatedAt": "2026-06-07T13:28:15"
      }
    ]
  },
  "requestId": "req_xxx"
}
```

失败响应示例：

```json
{
  "code": "INVALID_ARGUMENT",
  "message": "pageSize 不能超过 50",
  "data": null,
  "requestId": "req_xxx"
}
```

## 4. 获取视频详情

- 接口名称：获取视频详情
- 请求方法：`GET`
- 请求路径：`/api/v1/videos/{videoId}`
- 是否分页：否
- 是否记录日志：是
- 权限说明：当前实现要求登录

Path 参数：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `videoId` | string | 是 | 视频 ID |

失败响应示例：

```json
{
  "code": "NOT_FOUND",
  "message": "视频不存在",
  "data": null,
  "requestId": "req_xxx"
}
```

## 5. 删除我的视频

- 接口名称：删除我的视频
- 请求方法：`DELETE`
- 请求路径：`/api/v1/videos/{videoId}`
- 是否分页：否
- 是否记录日志：是
- 权限说明：作者本人或管理员

Path 参数：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `videoId` | string | 是 | 视频 ID |

成功响应示例：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "videoId": "vid_1234567890",
    "deleted": true,
    "deletedAt": "2026-06-07T13:40:00"
  },
  "requestId": "req_xxx"
}
```

失败响应示例：

```json
{
  "code": "PERMISSION_DENIED",
  "message": "无权限操作该资源",
  "data": null,
  "requestId": "req_xxx"
}
```

## 6. curl 示例

发布视频：

```bash
curl -X POST "http://localhost:8080/api/v1/videos" \
  -H "Authorization: Bearer <token>" \
  -F "title=我的视频" \
  -F "description=视频描述" \
  -F "file=@demo.mp4" \
  -F "coverFile=@cover.jpg"
```

查看我的视频：

```bash
curl "http://localhost:8080/api/v1/users/me/videos?page=1&pageSize=10" \
  -H "Authorization: Bearer <token>"
```

删除视频：

```bash
curl -X DELETE "http://localhost:8080/api/v1/videos/vid_1234567890" \
  -H "Authorization: Bearer <token>"
```

## 7. 测试建议

- 正常上传视频
- 未登录上传视频，预期 `401`
- 上传非法后缀文件，预期 `400`
- 分页查看我的视频
- 删除自己的视频成功
- 删除他人视频失败，预期 `403`
- 删除不存在视频失败，预期 `404`
- 删除后我的视频列表不再返回该视频
