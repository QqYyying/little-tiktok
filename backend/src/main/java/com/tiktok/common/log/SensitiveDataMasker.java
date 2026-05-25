package com.tiktok.common.log;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Map;

@Component
public class SensitiveDataMasker {

    private static final String MASK_VALUE = "***";
    private static final int MAX_LENGTH = 4000;

    private final ObjectMapper objectMapper;

    public SensitiveDataMasker(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String toMaskedJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            JsonNode node = objectMapper.convertValue(value, JsonNode.class);
            return truncate(objectMapper.writeValueAsString(mask(node, null)));
        } catch (Exception e) {
            return truncate(String.valueOf(value));
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
        return node;
    }

    private boolean isSensitiveField(String fieldName) {
        if (fieldName == null) {
            return false;
        }
        String normalized = fieldName.replace("_", "")
                .replace("-", "")
                .toLowerCase(Locale.ROOT);
        return "password".equals(normalized)
                || "passwordhash".equals(normalized)
                || normalized.contains("token")
                || normalized.contains("authorization");
    }

    private String truncate(String value) {
        if (value == null || value.length() <= MAX_LENGTH) {
            return value;
        }
        return value.substring(0, MAX_LENGTH);
    }
}
