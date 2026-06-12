package com.tiktok.favorite.dto;

public class FavoriteStatusResponse {

    private String videoId;
    private boolean favorited;
    private int favoriteCount;

    public FavoriteStatusResponse() {
    }

    public FavoriteStatusResponse(String videoId, boolean favorited, int favoriteCount) {
        this.videoId = videoId;
        this.favorited = favorited;
        this.favoriteCount = favoriteCount;
    }

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public boolean isFavorited() {
        return favorited;
    }

    public void setFavorited(boolean favorited) {
        this.favorited = favorited;
    }

    public int getFavoriteCount() {
        return favoriteCount;
    }

    public void setFavoriteCount(int favoriteCount) {
        this.favoriteCount = favoriteCount;
    }
}