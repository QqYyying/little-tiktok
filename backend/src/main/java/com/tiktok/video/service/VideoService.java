package com.tiktok.video.service;

import com.tiktok.common.auth.PermissionUtils;
import com.tiktok.common.auth.UserContext;
import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.common.utils.ResourceIdUtil;
import com.tiktok.infrastructure.storage.FileService;
import com.tiktok.infrastructure.storage.StoredFile;
import com.tiktok.video.dto.CreateVideoJsonRequest;
import com.tiktok.video.dto.CreateVideoUploadRequest;
import com.tiktok.video.dto.DeleteVideoResponse;
import com.tiktok.video.dto.MyVideoPageResponse;
import com.tiktok.video.dto.VideoResponse;
import com.tiktok.video.entity.Video;
import com.tiktok.video.mapper.VideoMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VideoService {

    private static final String VIDEO_STATUS_ACTIVE = "ACTIVE";
    private static final String VIDEO_STATUS_DELETED = "DELETED";
    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 50;

    private final VideoMapper videoMapper;
    private final FileService fileService;

    public VideoService(VideoMapper videoMapper, FileService fileService) {
        this.videoMapper = videoMapper;
        this.fileService = fileService;
    }

    @Transactional
    public VideoResponse createByUpload(CreateVideoUploadRequest request) {
        PermissionUtils.requireLogin();
        MultipartFile videoFile = request.getFile();
        if (videoFile == null || videoFile.isEmpty()) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "video file must not be empty");
        }

        StoredFile storedVideo = fileService.storeVideo(videoFile);
        StoredFile storedCover = request.getCoverFile() == null || request.getCoverFile().isEmpty()
                ? null
                : fileService.storeCover(request.getCoverFile());

        Video video = buildVideo(
                normalizeTitle(request.getTitle()),
                normalizeDescription(request.getDescription()),
                storedVideo.getUrl(),
                storedCover == null ? trimToEmpty(request.getCoverUrl()) : storedCover.getUrl()
        );
        videoMapper.insert(video);
        return toResponse(video, UserContext.getCurrentUsername());
    }

    @Transactional
    public VideoResponse createByUrl(CreateVideoJsonRequest request) {
        PermissionUtils.requireLogin();
        Video video = buildVideo(
                normalizeTitle(request.getTitle()),
                normalizeDescription(request.getDescription()),
                normalizeUrl(request.getVideoUrl(), "videoUrl"),
                trimToEmpty(request.getCoverUrl())
        );
        videoMapper.insert(video);
        return toResponse(video, UserContext.getCurrentUsername());
    }

    public MyVideoPageResponse pageMyVideos(Integer page, Integer pageSize, String keyword) {
        PermissionUtils.requireLogin();
        int normalizedPage = page == null || page < 1 ? DEFAULT_PAGE : page;
        int normalizedPageSize = pageSize == null || pageSize < 1 ? DEFAULT_PAGE_SIZE : Math.min(pageSize, MAX_PAGE_SIZE);
        int offset = (normalizedPage - 1) * normalizedPageSize;
        String normalizedKeyword = trimToNull(keyword);

        long total = videoMapper.countByAuthorId(UserContext.getCurrentUserId(), normalizedKeyword);
        List<VideoResponse> records = videoMapper.selectPageByAuthorId(
                        UserContext.getCurrentUserId(),
                        normalizedKeyword,
                        normalizedPageSize,
                        offset
                ).stream()
                .map(video -> toResponse(video, video.getAuthorName()))
                .toList();

        MyVideoPageResponse response = new MyVideoPageResponse();
        response.setTotal(total);
        response.setPage(normalizedPage);
        response.setPageSize(normalizedPageSize);
        response.setRecords(records);
        return response;
    }

    public MyVideoPageResponse pageLikedVideos(Integer page, Integer pageSize) {
        PermissionUtils.requireLogin();
        int normalizedPage = page == null || page < 1 ? DEFAULT_PAGE : page;
        int normalizedPageSize = pageSize == null || pageSize < 1 ? DEFAULT_PAGE_SIZE : Math.min(pageSize, MAX_PAGE_SIZE);
        int offset = (normalizedPage - 1) * normalizedPageSize;

        long total = videoMapper.countLikedVideos(UserContext.getCurrentUserId());
        List<VideoResponse> records = videoMapper.findLikedVideosPage(
                        UserContext.getCurrentUserId(),
                        normalizedPageSize,
                        offset
                ).stream()
                .map(video -> toResponse(video, video.getAuthorName()))
                .toList();

        MyVideoPageResponse response = new MyVideoPageResponse();
        response.setTotal(total);
        response.setPage(normalizedPage);
        response.setPageSize(normalizedPageSize);
        response.setRecords(records);
        return response;
    }

    public VideoResponse getVideoDetail(String videoId) {
        PermissionUtils.requireLogin();
        Video video = requireVisibleVideo(videoId);
        PermissionUtils.requireOwnerOrAdmin(video.getAuthorId());
        return toResponse(video, video.getAuthorName());
    }

    @Transactional
    public DeleteVideoResponse deleteVideo(String videoId) {
        Video video = requireVisibleVideo(videoId);
        PermissionUtils.requireOwnerOrAdmin(video.getAuthorId());

        LocalDateTime now = LocalDateTime.now();
        int updatedRows = videoMapper.logicalDelete(video.getId(), VIDEO_STATUS_DELETED, now, now);
        if (updatedRows == 0) {
            throw new BizException(ErrorCode.CONFLICT, "video has already been deleted");
        }

        fileService.delete(video.getVideoUrl());
        fileService.delete(video.getCoverUrl());

        DeleteVideoResponse response = new DeleteVideoResponse();
        response.setVideoId(video.getId());
        response.setDeleted(true);
        response.setDeletedAt(now);
        return response;
    }

    private Video requireVisibleVideo(String videoId) {
        String normalizedVideoId = trimToNull(videoId);
        if (normalizedVideoId == null) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "videoId must not be empty");
        }
        Video video = videoMapper.selectById(normalizedVideoId);
        if (video == null || VIDEO_STATUS_DELETED.equalsIgnoreCase(video.getStatus())) {
            throw new BizException(ErrorCode.NOT_FOUND, "video not found");
        }
        return video;
    }

    private Video buildVideo(String title, String description, String videoUrl, String coverUrl) {
        LocalDateTime now = LocalDateTime.now();
        Video video = new Video();
        video.setId(ResourceIdUtil.nextVideoId());
        video.setAuthorId(UserContext.getCurrentUserId());
        video.setAuthorName(UserContext.getCurrentUsername());
        video.setTitle(title);
        video.setDescription(description);
        video.setVideoUrl(videoUrl);
        video.setCoverUrl(coverUrl);
        video.setLikeCount(0);
        video.setStatus(VIDEO_STATUS_ACTIVE);
        video.setCreatedAt(now);
        video.setUpdatedAt(now);
        return video;
    }

    private VideoResponse toResponse(Video video, String authorName) {
        VideoResponse response = new VideoResponse();
        response.setVideoId(video.getId());
        response.setAuthorId(video.getAuthorId());
        response.setAuthorName(authorName);
        response.setTitle(video.getTitle());
        response.setDescription(video.getDescription());
        response.setVideoUrl(video.getVideoUrl());
        response.setCoverUrl(video.getCoverUrl());
        response.setLikeCount(video.getLikeCount());
        response.setFavoriteCount(video.getFavoriteCount());
        response.setCommentCount(video.getCommentCount());
        response.setStatus(video.getStatus());
        response.setCreatedAt(video.getCreatedAt());
        response.setUpdatedAt(video.getUpdatedAt());
        return response;
    }

    private String normalizeTitle(String title) {
        String normalized = trimToNull(title);
        if (normalized == null) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "title must not be empty");
        }
        if (normalized.length() > 128) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "title length must be <= 128");
        }
        return normalized;
    }

    private String normalizeDescription(String description) {
        String normalized = trimToEmpty(description);
        if (normalized.length() > 500) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "description length must be <= 500");
        }
        return normalized;
    }

    private String normalizeUrl(String value, String fieldName) {
        String normalized = trimToNull(value);
        if (normalized == null) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, fieldName + " must not be empty");
        }
        if (normalized.length() > 512) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, fieldName + " length must be <= 512");
        }
        return normalized;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
