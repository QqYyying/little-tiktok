package com.tiktok.recommend.service;

import com.tiktok.favorite.mapper.FavoriteMapper;
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
    private final FavoriteMapper favoriteMapper;

    public RecommendationService(VideoMapper videoMapper, LikeMapper likeMapper, FavoriteMapper favoriteMapper) {
        this.videoMapper = videoMapper;
        this.likeMapper = likeMapper;
        this.favoriteMapper = favoriteMapper;
    }

    public RecommendFeedResponse getRecommendFeed(String userId, int count, int offset) {
        int normalizedCount = normalizeCount(count);
        int normalizedOffset = Math.max(offset, 0);

        if (userId == null || userId.isBlank()) {
            return getGuestRecommendFeed(normalizedCount, normalizedOffset);
        }

        long recommendableVideoCount = videoMapper.countUnviewedActiveVideos(userId);
        if (recommendableVideoCount <= 0 || normalizedOffset >= recommendableVideoCount) {
            return new RecommendFeedResponse(List.of(), false);
        }

        List<Video> videos = videoMapper.findUnviewedRecommendVideosPage(userId, normalizedCount, normalizedOffset);

        List<RecommendVideoItemResponse> items = videos.stream()
                .map(video -> toItem(userId, video))
                .toList();

        boolean hasMore = normalizedOffset + items.size() < recommendableVideoCount;
        return new RecommendFeedResponse(items, hasMore);
    }

    private RecommendFeedResponse getGuestRecommendFeed(int count, int offset) {
        long recommendableVideoCount = videoMapper.countActiveVideos();
        if (recommendableVideoCount <= 0 || offset >= recommendableVideoCount) {
            return new RecommendFeedResponse(List.of(), false);
        }

        List<RecommendVideoItemResponse> items = videoMapper.findActiveVideosPage(count, offset)
                .stream()
                .map(this::toGuestItem)
                .toList();

        boolean hasMore = offset + items.size() < recommendableVideoCount;
        return new RecommendFeedResponse(items, hasMore);
    }

    private RecommendVideoItemResponse toItem(String userId, Video video) {
        boolean liked = likeMapper.existsLike(userId, video.getId()) > 0;
        boolean favorited = favoriteMapper.existsFavorite(userId, video.getId()) > 0;
        RecommendVideoItemResponse item = toGuestItem(video);
        item.setLiked(liked);
        item.setFavorited(favorited);
        return item;
    }

    private RecommendVideoItemResponse toGuestItem(Video video) {
        RecommendVideoItemResponse item = new RecommendVideoItemResponse();
        item.setVideoId(video.getId());
        item.setAuthorId(video.getAuthorId());
        item.setAuthorName(video.getAuthorName());
        item.setTitle(video.getTitle());
        item.setDescription(video.getDescription());
        item.setVideoUrl(video.getVideoUrl());
        item.setCoverUrl(video.getCoverUrl());
        item.setLikeCount(video.getLikeCount());
        item.setFavoriteCount(video.getFavoriteCount());
        item.setCommentCount(video.getCommentCount());
        item.setLiked(false);
        item.setFavorited(false);
        item.setCreatedAt(video.getCreatedAt());
        return item;
    }

    private int normalizeCount(int count) {
        if (count <= 0) {
            return DEFAULT_COUNT;
        }
        return Math.min(count, MAX_COUNT);
    }
}
