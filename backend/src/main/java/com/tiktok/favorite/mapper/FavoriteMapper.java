package com.tiktok.favorite.mapper;

import org.apache.ibatis.annotations.Param;

public interface FavoriteMapper {

    int insertFavorite(@Param("id") String id, @Param("userId") String userId, @Param("videoId") String videoId);

    int deleteFavorite(@Param("userId") String userId, @Param("videoId") String videoId);

    int existsFavorite(@Param("userId") String userId, @Param("videoId") String videoId);

    int countFavorite(@Param("videoId") String videoId);

    long countUserFavorites(@Param("userId") String userId);

    java.util.List<com.tiktok.video.entity.Video> findUserFavoritesPage(@Param("userId") String userId,
                                                                        @Param("limit") int limit,
                                                                        @Param("offset") int offset);
}