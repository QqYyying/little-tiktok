package com.tiktok.favorite.service;

import com.tiktok.common.auth.PermissionUtils;
import com.tiktok.common.auth.UserContext;
import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.common.utils.ResourceIdUtil;
import com.tiktok.favorite.dto.FavoriteStatusResponse;
import com.tiktok.favorite.mapper.FavoriteMapper;
import com.tiktok.video.dto.MyVideoPageResponse;
import com.tiktok.video.dto.VideoResponse;
import com.tiktok.video.entity.Video;
import com.tiktok.video.mapper.VideoMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    private static final String VIDEO_STATUS_ACTIVE = "ACTIVE";
    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 50;

    private final FavoriteMapper favoriteMapper;
    private final VideoMapper videoMapper;

    public FavoriteService(FavoriteMapper favoriteMapper, VideoMapper videoMapper) {
        this.favoriteMapper = favoriteMapper;
        this.videoMapper = videoMapper;
    }

    @Transactional
    public FavoriteStatusResponse favoriteVideo(String userId, String videoId) {
        validateUserId(userId);
        validateVideoId(videoId);
        ensureVisibleVideo(videoId);

        int inserted = favoriteMapper.insertFavorite(ResourceIdUtil.nextFavoriteId(), userId, videoId);
        if (inserted > 0) {
            videoMapper.incrementFavoriteCount(videoId);
        }

        int favoriteCount = videoMapper.getFavoriteCount(videoId);
        return new FavoriteStatusResponse(videoId, true, favoriteCount);
    }

    @Transactional
    public FavoriteStatusResponse unfavoriteVideo(String userId, String videoId) {
        validateUserId(userId);
        validateVideoId(videoId);
        ensureVisibleVideo(videoId);

        int deleted = favoriteMapper.deleteFavorite(userId, videoId);
        if (deleted > 0) {
            videoMapper.decrementFavoriteCount(videoId);
        }

        int favoriteCount = videoMapper.getFavoriteCount(videoId);
        return new FavoriteStatusResponse(videoId, false, favoriteCount);
    }

    public FavoriteStatusResponse getFavoriteStatus(String userId, String videoId) {
        validateUserId(userId);
        validateVideoId(videoId);
        ensureVisibleVideo(videoId);

        boolean favorited = favoriteMapper.existsFavorite(userId, videoId) > 0;
        int favoriteCount = videoMapper.getFavoriteCount(videoId);
        return new FavoriteStatusResponse(videoId, favorited, favoriteCount);
    }

    public MyVideoPageResponse pageUserFavorites(Integer page, Integer pageSize) {
        PermissionUtils.requireLogin();
        int normalizedPage = page == null || page < 1 ? DEFAULT_PAGE : page;
        int normalizedPageSize = pageSize == null || pageSize < 1 ? DEFAULT_PAGE_SIZE : Math.min(pageSize, MAX_PAGE_SIZE);
        int offset = (normalizedPage - 1) * normalizedPageSize;

        long total = favoriteMapper.countUserFavorites(UserContext.getCurrentUserId());
        List<VideoResponse> records = favoriteMapper.findUserFavoritesPage(
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

    private void ensureVisibleVideo(String videoId) {
        if (!videoMapper.existsVisibleVideo(videoId)) {
            throw new BizException(ErrorCode.NOT_FOUND, "视频不存在或不可见");
        }
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "userId 不能为空");
        }
    }

    private void validateVideoId(String videoId) {
        if (videoId == null || videoId.isBlank()) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "videoId 不能为空");
        }
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
        response.setStatus(video.getStatus());
        response.setCreatedAt(video.getCreatedAt());
        response.setUpdatedAt(video.getUpdatedAt());
        return response;
    }
}