package com.tiktok.admin.controller;

import com.tiktok.common.auth.PermissionUtils;
import com.tiktok.common.auth.UserContext;
import com.tiktok.log.dto.ApiMetricsQueryRequest;
import com.tiktok.log.dto.ApiMetricsResponse;
import com.tiktok.log.dto.RequestLogPageQuery;
import com.tiktok.log.dto.RequestLogPageResponse;
import com.tiktok.log.service.RequestLogAdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final RequestLogAdminService requestLogAdminService;

    public AdminController(RequestLogAdminService requestLogAdminService) {
        this.requestLogAdminService = requestLogAdminService;
    }

    @GetMapping("/request-logs")
    public RequestLogPageResponse requestLogs(RequestLogPageQuery query) {
        PermissionUtils.requireAdmin();
        return requestLogAdminService.pageRequestLogs(query);
    }

    @GetMapping("/api-metrics")
    public ApiMetricsResponse apiMetrics(ApiMetricsQueryRequest query) {
        PermissionUtils.requireAdmin();
        return requestLogAdminService.getApiMetrics(query);
    }

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
