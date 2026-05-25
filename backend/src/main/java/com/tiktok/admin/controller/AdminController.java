package com.tiktok.admin.controller;

import com.tiktok.common.auth.PermissionUtils;
import com.tiktok.common.auth.UserContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        PermissionUtils.requireAdmin();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "admin ok");
        result.put("userId", UserContext.getCurrentUserId());
        result.put("role", UserContext.getCurrentRole());
        return result;
    }
}
