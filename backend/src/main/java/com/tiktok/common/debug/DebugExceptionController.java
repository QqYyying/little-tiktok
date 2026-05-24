package com.tiktok.common.debug;

import com.tiktok.common.enums.ErrorCode;
import com.tiktok.common.exception.BizException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/debug/exceptions")
public class DebugExceptionController {

    @GetMapping("/biz-not-found")
    public void throwBizNotFound() {
        throw new BizException(ErrorCode.NOT_FOUND);
    }

    @GetMapping("/biz-permission-denied")
    public void throwBizPermissionDenied() {
        throw new BizException(ErrorCode.PERMISSION_DENIED, "无权限删除该视频");
    }

    @GetMapping("/illegal-argument")
    public void throwIllegalArgument() {
        throw new IllegalArgumentException("参数不合法");
    }

    @PostMapping("/valid")
    public void validateRequest(@Valid @RequestBody DebugValidRequest request) {
    }

    public static class DebugValidRequest {

        @NotBlank(message = "不能为空")
        private String username;

        @Size(min = 6, message = "长度不能小于 6")
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
}
