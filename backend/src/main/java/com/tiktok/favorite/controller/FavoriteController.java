package com.tiktok.favorite.controller;

import com.tiktok.favorite.dto.FavoriteStatusResponse;
import com.tiktok.favorite.service.FavoriteService;
import com.tiktok.video.dto.MyVideoPageResponse;
import com.tiktok.common.auth.UserContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Favorite", description = "视频收藏接口")
@Validated
@RestController
@RequestMapping("/api/v1")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @Operation(summary = "收藏视频")
    @PostMapping("/videos/{videoId}/favorite")
    public FavoriteStatusResponse favoriteVideo(@PathVariable("videoId") String videoId) {
        return favoriteService.favoriteVideo(UserContext.getCurrentUserId(), videoId);
    }

    @Operation(summary = "取消收藏视频")
    @DeleteMapping("/videos/{videoId}/favorite")
    public FavoriteStatusResponse unfavoriteVideo(@PathVariable("videoId") String videoId) {
        return favoriteService.unfavoriteVideo(UserContext.getCurrentUserId(), videoId);
    }

    @Operation(summary = "获取收藏状态")
    @GetMapping("/videos/{videoId}/favorite/status")
    public FavoriteStatusResponse getFavoriteStatus(@PathVariable("videoId") String videoId) {
        return favoriteService.getFavoriteStatus(UserContext.getCurrentUserId(), videoId);
    }

    @Operation(summary = "分页查看我的收藏")
    @GetMapping("/users/me/videos/favorites")
    public MyVideoPageResponse pageFavorites(
            @RequestParam(value = "page", required = false) @Min(value = 1, message = "page must be >= 1") Integer page,
            @RequestParam(value = "pageSize", required = false) @Min(value = 1, message = "pageSize must be >= 1")
            @Max(value = 50, message = "pageSize must be <= 50") Integer pageSize) {
        return favoriteService.pageUserFavorites(page, pageSize);
    }
}