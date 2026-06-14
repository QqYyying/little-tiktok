package com.tiktok.comment.controller;

import com.tiktok.comment.dto.CommentRequest;
import com.tiktok.comment.dto.CommentResponse;
import com.tiktok.comment.service.CommentService;
import com.tiktok.common.result.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping("/{videoId}")
    public Result<CommentResponse> createComment(
            @PathVariable String videoId,
            @Valid @RequestBody CommentRequest request) {
        CommentResponse response = commentService.createComment(videoId, request);
        return Result.success(response);
    }

    @DeleteMapping("/{commentId}")
    public Result<Void> deleteComment(@PathVariable String commentId) {
        commentService.deleteComment(commentId);
        return Result.success();
    }

    @PostMapping("/{commentId}/like")
    public Result<Void> likeComment(@PathVariable String commentId) {
        commentService.likeComment(commentId);
        return Result.success();
    }

    @PostMapping("/{commentId}/unlike")
    public Result<Void> unlikeComment(@PathVariable String commentId) {
        commentService.unlikeComment(commentId);
        return Result.success();
    }

    @GetMapping("/{videoId}")
    public Result<Map<String, Object>> getComments(
            @PathVariable String videoId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        List<CommentResponse> comments = commentService.getComments(videoId, page, pageSize);
        Integer total = commentService.getCommentCount(videoId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("items", comments);
        result.put("total", total);
        result.put("page", page);
        result.put("pageSize", pageSize);
        
        return Result.success(result);
    }
}