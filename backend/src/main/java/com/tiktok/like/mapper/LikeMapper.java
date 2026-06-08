package com.tiktok.like.mapper;

import org.apache.ibatis.annotations.Param;

public interface LikeMapper {

    int insertLike(@Param("id") String id, @Param("userId") String userId, @Param("videoId") String videoId);

    int deleteLike(@Param("userId") String userId, @Param("videoId") String videoId);

    int existsLike(@Param("userId") String userId, @Param("videoId") String videoId);

    int countLike(@Param("videoId") String videoId);
}
