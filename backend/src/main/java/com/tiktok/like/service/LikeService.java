package com.tiktok.like.service;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.common.utils.ResourceIdUtil;
import com.tiktok.like.dto.LikeStatusResponse;
import com.tiktok.like.mapper.LikeMapper;
import com.tiktok.video.mapper.VideoMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikeService {

    private final LikeMapper likeMapper;
    private final VideoMapper videoMapper;

    public LikeService(LikeMapper likeMapper, VideoMapper videoMapper) {
        this.likeMapper = likeMapper;
        this.videoMapper = videoMapper;
    }

    @Transactional
    public LikeStatusResponse likeVideo(String userId, String videoId) {
        validateUserId(userId);
        validateVideoId(videoId);
        ensureVisibleVideo(videoId);

        int inserted = likeMapper.insertLike(ResourceIdUtil.nextLikeId(), userId, videoId);
        if (inserted > 0) {
            videoMapper.incrementLikeCount(videoId);
        }

        int likeCount = videoMapper.getLikeCount(videoId);
        return new LikeStatusResponse(videoId, true, likeCount);
    }

    @Transactional
    public LikeStatusResponse unlikeVideo(String userId, String videoId) {
        validateUserId(userId);
        validateVideoId(videoId);
        ensureVisibleVideo(videoId);

        int deleted = likeMapper.deleteLike(userId, videoId);
        if (deleted > 0) {
            videoMapper.decrementLikeCount(videoId);
        }

        int likeCount = videoMapper.getLikeCount(videoId);
        return new LikeStatusResponse(videoId, false, likeCount);
    }

    public LikeStatusResponse getLikeStatus(String userId, String videoId) {
        validateUserId(userId);
        validateVideoId(videoId);
        ensureVisibleVideo(videoId);

        boolean liked = likeMapper.existsLike(userId, videoId) > 0;
        int likeCount = videoMapper.getLikeCount(videoId);
        return new LikeStatusResponse(videoId, liked, likeCount);
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
}
