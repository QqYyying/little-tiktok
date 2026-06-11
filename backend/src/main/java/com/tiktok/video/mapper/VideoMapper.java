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

    List<Video> findViewedRecommendVideos(@Param("userId") String userId, @Param("count") int count);

    List<Video> findViewedVideos(@Param("userId") String userId);

    boolean existsVisibleVideo(@Param("videoId") String videoId);

    int incrementLikeCount(@Param("videoId") String videoId);

    int decrementLikeCount(@Param("videoId") String videoId);

    int getLikeCount(@Param("videoId") String videoId);

    int logicalDelete(@Param("id") String id,
                      @Param("deletedStatus") String deletedStatus,
                      @Param("updatedAt") LocalDateTime updatedAt,
                      @Param("deletedAt") LocalDateTime deletedAt);
}
