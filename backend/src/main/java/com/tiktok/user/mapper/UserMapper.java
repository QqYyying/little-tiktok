package com.tiktok.user.mapper;

import com.tiktok.user.entity.User;
import org.apache.ibatis.annotations.Param;

public interface UserMapper {

    User selectByUsername(@Param("username") String username);

    int insert(User user);
}
