package com.tiktok.video.controller;

import com.tiktok.video.dto.CreateVideoJsonRequest;
import com.tiktok.video.dto.CreateVideoUploadRequest;
import com.tiktok.video.dto.DeleteVideoResponse;
import com.tiktok.video.dto.MyVideoPageResponse;
import com.tiktok.video.dto.VideoResponse;
import com.tiktok.video.service.VideoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Video", description = "我的视频管理接口")
@Validated
@RestController
@RequestMapping("/api/v1")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @Operation(summary = "发布视频（对象存储上传）")
    @PostMapping(value = "/videos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public VideoResponse createVideo(@Valid @ModelAttribute CreateVideoUploadRequest request) {
        return videoService.createByUpload(request);
    }

    @Operation(summary = "发布视频（直接提交媒体地址）")
    @PostMapping(value = "/videos", consumes = MediaType.APPLICATION_JSON_VALUE)
    public VideoResponse createVideoByUrl(@Valid @RequestBody CreateVideoJsonRequest request) {
        return videoService.createByUrl(request);
    }

    @Operation(summary = "分页查看我的视频")
    @GetMapping("/users/me/videos")
    public MyVideoPageResponse pageMyVideos(
            @RequestParam(value = "page", required = false) @Min(value = 1, message = "page must be >= 1") Integer page,
            @RequestParam(value = "pageSize", required = false) @Min(value = 1, message = "pageSize must be >= 1")
            @Max(value = 50, message = "pageSize must be <= 50") Integer pageSize,
            @RequestParam(value = "keyword", required = false) String keyword) {
        return videoService.pageMyVideos(page, pageSize, keyword);
    }

    @Operation(summary = "分页查看我点赞的视频")
    @GetMapping("/users/me/videos/liked")
    public MyVideoPageResponse pageLikedVideos(
            @RequestParam(value = "page", required = false) @Min(value = 1, message = "page must be >= 1") Integer page,
            @RequestParam(value = "pageSize", required = false) @Min(value = 1, message = "pageSize must be >= 1")
            @Max(value = 50, message = "pageSize must be <= 50") Integer pageSize) {
        return videoService.pageLikedVideos(page, pageSize);
    }

    @Operation(summary = "获取我的视频详情")
    @GetMapping("/videos/{videoId}")
    public VideoResponse getVideo(@PathVariable("videoId") String videoId) {
        return videoService.getVideoDetail(videoId);
    }

    @Operation(summary = "删除我的视频")
    @DeleteMapping("/videos/{videoId}")
    public DeleteVideoResponse deleteVideo(@PathVariable("videoId") String videoId) {
        return videoService.deleteVideo(videoId);
    }
}
