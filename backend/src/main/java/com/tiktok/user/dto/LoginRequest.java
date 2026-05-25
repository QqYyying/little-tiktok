package com.tiktok.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LoginRequest {

    @NotBlank(message = "不能为空")
    @Size(min = 3, max = 32, message = "长度必须在 3-32 之间")
    private String username;

    @NotBlank(message = "不能为空")
    @Size(min = 6, max = 64, message = "长度必须在 6-64 之间")
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
