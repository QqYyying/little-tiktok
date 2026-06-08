package com.tiktok.recommend.service;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import com.tiktok.like.mapper.LikeMapper;
import com.tiktok.recommend.dto.RecommendFeedResponse;
import com.tiktok.recommend.dto.RecommendVideoItemResponse;
import com.tiktok.video.entity.Video;
import com.tiktok.video.mapper.VideoMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationService {

    private static final int DEFAULT_COUNT = 5;
    private static final int MAX_COUNT = 20;

    private final VideoMapper videoMapper;
    private final LikeMapper likeMapper;

    public RecommendationService(VideoMapper videoMapper, LikeMapper likeMapper) {
        this.videoMapper = videoMapper;
        this.likeMapper = likeMapper;
    }

    public RecommendFeedResponse getRecommendFeed(String userId, int count) {
        validateUserId(userId);
        int normalizedCount = normalizeCount(count);

        List<Video> videos = videoMapper.findRecommendVideos(userId, normalizedCount);
        List<RecommendVideoItemResponse> items = videos.stream()
                .map(video -> toItem(userId, video))
                .toList();

        return new RecommendFeedResponse(items, videos.size() == normalizedCount);
    }

    private RecommendVideoItemResponse toItem(String userId, Video video) {
        boolean liked = likeMapper.existsLike(userId, video.getId()) > 0;
        return new RecommendVideoItemResponse(
                video.getId(),
                video.getAuthorId(),
                video.getAuthorName(),
                video.getTitle(),
                video.getDescription(),
                video.getVideoUrl(),
                video.getCoverUrl(),
                video.getLikeCount(),
                liked,
                video.getCreatedAt()
        );
    }

    private int normalizeCount(int count) {
        if (count <= 0) {
            return DEFAULT_COUNT;
        }
        return Math.min(count, MAX_COUNT);
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BizException(ErrorCode.INVALID_ARGUMENT, "userId 不能为空");
        }
    }
}
