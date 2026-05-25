package com.tiktok.common.log;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SensitiveDataMasker {

    private static final String MASK_VALUE = "***";
    private static final int MAX_LENGTH = 4000;
    private static final int JSON_PARSE_MAX_LENGTH = 100_000;
    private static final String TRUNCATED_SUFFIX = "...[truncated]";
    private static final String SENSITIVE_KEY_PATTERN = "password|passwd|pwd|passwordHash|password_hash|token|accessToken|access_token|refreshToken|refresh_token|authorization|cookie|setCookie|set-cookie|secret|jwt";
    private static final Pattern JSON_FIELD_PATTERN = Pattern.compile("(?i)([\\\"']\\s*(?:" + SENSITIVE_KEY_PATTERN + ")\\s*[\\\"']\\s*:\\s*[\\\"'])(.*?)([\\\"'])");
    private static final Pattern QUERY_FIELD_PATTERN = Pattern.compile("(?i)(\\b(?:" + SENSITIVE_KEY_PATTERN + ")\\b\\s*=\\s*)([^&\\s,;]+)");
    private static final Pattern AUTHORIZATION_HEADER_PATTERN = Pattern.compile("(?i)\\b(Authorization\\s*:\\s*)(Bearer|Basic)?\\s*([^\\s,;]+)");
    private static final Pattern COOKIE_HEADER_PATTERN = Pattern.compile("(?i)\\b((?:Set-Cookie|Cookie)\\s*:\\s*)([^\\r\\n]+)");
    private static final Pattern BEARER_TOKEN_PATTERN = Pattern.compile("(?i)\\b(Bearer\\s+)([A-Za-z0-9._~+\\-/]+=*)");
    private static final Pattern JWT_PATTERN = Pattern.compile("\\beyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\b");

    private final ObjectMapper objectMapper;

    public SensitiveDataMasker(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String toMaskedJson(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof CharSequence charSequence) {
            return truncate(maskString(charSequence.toString()));
        }
        try {
            JsonNode node = objectMapper.convertValue(value, JsonNode.class);
            String json = objectMapper.writeValueAsString(mask(node, null));
            return truncate(maskText(json));
        } catch (Exception e) {
            return truncate("[unserializable:" + value.getClass().getName() + "]");
        }
    }

    private JsonNode mask(JsonNode node, String fieldName) {
        if (node == null || node.isNull()) {
            return node;
        }
        if (isSensitiveField(fieldName)) {
            return objectMapper.getNodeFactory().textNode(MASK_VALUE);
        }
        if (node.isObject()) {
            ObjectNode result = objectMapper.createObjectNode();
            for (Map.Entry<String, JsonNode> field : node.properties()) {
                result.set(field.getKey(), mask(field.getValue(), field.getKey()));
            }
            return result;
        }
        if (node.isArray()) {
            ArrayNode result = objectMapper.createArrayNode();
            for (JsonNode item : node) {
                result.add(mask(item, fieldName));
            }
            return result;
        }
        if (node.isTextual()) {
            return objectMapper.getNodeFactory().textNode(maskText(node.textValue()));
        }
        return node;
    }

    private String maskString(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (isJsonCandidate(trimmed) && value.length() <= JSON_PARSE_MAX_LENGTH) {
            try {
                JsonNode node = objectMapper.readTree(value);
                return maskText(objectMapper.writeValueAsString(mask(node, null)));
            } catch (Exception ignored) {
                return maskText(value);
            }
        }
        return maskText(value);
    }

    private String maskText(String value) {
        if (value == null) {
            return null;
        }
        String masked = maskHeader(value, AUTHORIZATION_HEADER_PATTERN, true);
        masked = maskHeader(masked, COOKIE_HEADER_PATTERN, false);
        masked = JSON_FIELD_PATTERN.matcher(masked).replaceAll("$1" + MASK_VALUE + "$3");
        masked = QUERY_FIELD_PATTERN.matcher(masked).replaceAll("$1" + MASK_VALUE);
        masked = BEARER_TOKEN_PATTERN.matcher(masked).replaceAll("$1" + MASK_VALUE);
        return JWT_PATTERN.matcher(masked).replaceAll(MASK_VALUE);
    }

    private String maskHeader(String value, Pattern pattern, boolean keepScheme) {
        Matcher matcher = pattern.matcher(value);
        StringBuffer result = new StringBuffer();
        while (matcher.find()) {
            String replacement = matcher.group(1);
            if (keepScheme && matcher.group(2) != null && !matcher.group(2).isBlank()) {
                replacement += matcher.group(2) + " ";
            }
            replacement += MASK_VALUE;
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    private boolean isSensitiveField(String fieldName) {
        if (fieldName == null) {
            return false;
        }
        String normalized = fieldName.replaceAll("[^A-Za-z0-9]", "").toLowerCase(Locale.ROOT);
        return normalized.contains("password")
                || normalized.contains("passwd")
                || "pwd".equals(normalized)
                || normalized.contains("token")
                || normalized.contains("authorization")
                || normalized.contains("cookie")
                || normalized.contains("secret")
                || normalized.contains("jwt");
    }

    private boolean isJsonCandidate(String value) {
        return (value.startsWith("{") && value.endsWith("}")) || (value.startsWith("[") && value.endsWith("]"));
    }

    private String truncate(String value) {
        if (value == null || value.length() <= MAX_LENGTH) {
            return value;
        }
        int endIndex = Math.max(0, MAX_LENGTH - TRUNCATED_SUFFIX.length());
        return value.substring(0, endIndex) + TRUNCATED_SUFFIX;
    }
}
