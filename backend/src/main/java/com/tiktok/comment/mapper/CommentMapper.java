package com.tiktok.comment.mapper;

import com.tiktok.comment.entity.Comment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommentMapper {
    int insert(Comment comment);
    int deleteById(@Param("id") String id);
    int updateLikeCount(@Param("id") String id, @Param("delta") Integer delta);
    Comment selectById(@Param("id") String id);
    List<Comment> selectByVideoId(@Param("videoId") String videoId, @Param("offset") Integer offset, @Param("limit") Integer limit);
    int countByVideoId(@Param("videoId") String videoId);
}