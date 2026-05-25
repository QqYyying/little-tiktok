package com.tiktok.user.mapper;

import com.tiktok.user.entity.TokenBlacklist;
import org.apache.ibatis.annotations.Param;

public interface TokenBlacklistMapper {

    TokenBlacklist selectByToken(@Param("token") String token);

    int insert(TokenBlacklist tokenBlacklist);

    int existsByToken(@Param("token") String token);
}
