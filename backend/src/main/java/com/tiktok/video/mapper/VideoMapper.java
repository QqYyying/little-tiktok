package com.tiktok.video.mapper;

import com.tiktok.video.entity.Video;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface VideoMapper {

    int insert(Video video);

    Video selectById(@Param("id") String id);

    long countByAuthorId(@Param("authorId") String authorId, @Param("keyword") String keyword);

    List<Video> selectPageByAuthorId(@Param("authorId") String authorId,
                                     @Param("keyword") String keyword,
                                     @Param("limit") int limit,
                                     @Param("offset") int offset);

    List<Video> findRecommendVideos(@Param("userId") String userId, @Param("count") int count);

    long countActiveVideos();

    long countUnviewedActiveVideos(@Param("userId") String userId);

    List<Video> findActiveVideosPage(@Param("count") int count, @Param("offset") int offset);

    List<Video> findUnviewedRecommendVideosPage(@Param("userId") String userId,
                                                @Param("limit") int limit,
                                                @Param("offset") int offset);

    List<Video> findViewedVideos(@Param("userId") String userId);

    long countLikedVideos(@Param("userId") String userId);

    List<Video> findLikedVideosPage(@Param("userId") String userId,
                                     @Param("limit") int limit,
                                     @Param("offset") int offset);

    boolean existsVisibleVideo(@Param("videoId") String videoId);

    int incrementLikeCount(@Param("videoId") String videoId);

    int decrementLikeCount(@Param("videoId") String videoId);

    int getLikeCount(@Param("videoId") String videoId);

    int incrementFavoriteCount(@Param("videoId") String videoId);

    int decrementFavoriteCount(@Param("videoId") String videoId);

    int getFavoriteCount(@Param("videoId") String videoId);

    int logicalDelete(@Param("id") String id,
                      @Param("deletedStatus") String deletedStatus,
                      @Param("updatedAt") LocalDateTime updatedAt,
                      @Param("deletedAt") LocalDateTime deletedAt);
}
