package com.tiktok.comment.service;

import com.tiktok.comment.dto.CommentRequest;
import com.tiktok.comment.dto.CommentResponse;
import com.tiktok.comment.entity.Comment;
import com.tiktok.comment.mapper.CommentMapper;
import com.tiktok.common.utils.ResourceIdUtil;
import com.tiktok.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentMapper commentMapper;
    private final UserMapper userMapper;

    @Transactional
    public CommentResponse createComment(String videoId, CommentRequest request) {
        String userId = com.tiktok.common.auth.UserContext.getCurrentUserId();

        Comment comment = Comment.builder()
                .id(ResourceIdUtil.nextCommentId())
                .videoId(videoId)
                .userId(userId)
                .content(request.getContent())
                .replyToId(request.getReplyToId())
                .likeCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        commentMapper.insert(comment);
        return buildResponse(comment);
    }

    @Transactional
    public void deleteComment(String commentId) {
        String userId = com.tiktok.common.auth.UserContext.getCurrentUserId();
        Comment comment = commentMapper.selectById(commentId);

        if (comment == null) {
            throw new RuntimeException("Comment not found");
        }

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("No permission to delete this comment");
        }

        commentMapper.deleteById(commentId);
    }

    @Transactional
    public void likeComment(String commentId) {
        commentMapper.updateLikeCount(commentId, 1);
    }

    @Transactional
    public void unlikeComment(String commentId) {
        commentMapper.updateLikeCount(commentId, -1);
    }

    public List<CommentResponse> getComments(String videoId, Integer page, Integer pageSize) {
        Integer offset = (page - 1) * pageSize;
        List<Comment> comments = commentMapper.selectByVideoId(videoId, offset, pageSize);
        return comments.stream().map(this::buildResponse).collect(Collectors.toList());
    }

    public Integer getCommentCount(String videoId) {
        return commentMapper.countByVideoId(videoId);
    }

    private CommentResponse buildResponse(Comment comment) {
        var user = userMapper.selectById(comment.getUserId());
        String username = user != null ? user.getUsername() : "Unknown user";

        String replyToUsername = null;
        if (comment.getReplyToId() != null) {
            Comment replyTo = commentMapper.selectById(comment.getReplyToId());
            if (replyTo != null) {
                var replyUser = userMapper.selectById(replyTo.getUserId());
                replyToUsername = replyUser != null ? replyUser.getUsername() : "Unknown user";
            }
        }

        return CommentResponse.builder()
                .id(comment.getId())
                .videoId(comment.getVideoId())
                .userId(comment.getUserId())
                .username(username)
                .content(comment.getContent())
                .likeCount(comment.getLikeCount())
                .liked(false)
                .replyToId(comment.getReplyToId())
                .replyToUsername(replyToUsername)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
