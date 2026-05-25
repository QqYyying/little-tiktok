package com.tiktok.common.log;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class SensitiveDataMaskerTest {

    private final SensitiveDataMasker masker = new SensitiveDataMasker(new ObjectMapper());

    @Test
    void masksNestedJsonFields() {
        Map<String, Object> nested = new LinkedHashMap<>();
        nested.put("accessToken", "abc123");
        nested.put("refresh_token", "def456");

        Map<String, Object> input = new LinkedHashMap<>();
        input.put("username", "alex_coder");
        input.put("password", "123456");
        input.put("token", "eyJhbGciOiJIUzI1NiJ9.xxx.yyy");
        input.put("nested", nested);
        input.put("items", List.of(Map.of("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.xxx.yyy")));

        String masked = masker.toMaskedJson(input);

        assertThat(masked).contains("\"password\":\"***\"");
        assertThat(masked).contains("\"token\":\"***\"");
        assertThat(masked).contains("\"accessToken\":\"***\"");
        assertThat(masked).contains("\"refresh_token\":\"***\"");
        assertThat(masked).contains("\"Authorization\":\"***\"");
        assertThat(masked).doesNotContain("123456", "abc123", "def456", "eyJhbGciOiJIUzI1NiJ9.xxx.yyy");
    }

    @Test
    void masksPlainStringSecrets() {
        String masked = masker.toMaskedJson("Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.xxx.yyy token=abc123 access_token=def456 password=123456");

        assertThat(masked).contains("Authorization: Bearer ***");
        assertThat(masked).contains("token=***");
        assertThat(masked).contains("access_token=***");
        assertThat(masked).contains("password=***");
        assertThat(masked).doesNotContain("eyJhbGciOiJIUzI1NiJ9.xxx.yyy", "abc123", "def456", "123456");
    }

    @Test
    void masksJsonStringAndTruncatesWithSuffix() {
        String json = "{\"nested\":{\"password_hash\":\"hash-value\",\"jwt\":\"eyJhbGciOiJIUzI1NiJ9.xxx.yyy\"}}";
        String masked = masker.toMaskedJson(json);

        assertThat(masked).contains("\"password_hash\":\"***\"");
        assertThat(masked).contains("\"jwt\":\"***\"");
        assertThat(masked).doesNotContain("hash-value", "eyJhbGciOiJIUzI1NiJ9.xxx.yyy");

        String longValue = "safe".repeat(2000);
        String truncated = masker.toMaskedJson(longValue);
        assertThat(truncated).hasSize(4000);
        assertThat(truncated).endsWith("...[truncated]");
    }
}
