package com.tiktok.comment.controller;

import com.tiktok.comment.dto.CommentRequest;
import com.tiktok.comment.dto.CommentResponse;
import com.tiktok.comment.service.CommentService;
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
    public CommentResponse createComment(
            @PathVariable String videoId,
            @Valid @RequestBody CommentRequest request) {
        return commentService.createComment(videoId, request);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable String commentId) {
        commentService.deleteComment(commentId);
    }

    @PostMapping("/{commentId}/like")
    public void likeComment(@PathVariable String commentId) {
        commentService.likeComment(commentId);
    }

    @PostMapping("/{commentId}/unlike")
    public void unlikeComment(@PathVariable String commentId) {
        commentService.unlikeComment(commentId);
    }

    @GetMapping("/{videoId}")
    public Map<String, Object> getComments(
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

        return result;
    }
}
