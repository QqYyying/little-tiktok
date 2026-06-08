package com.tiktok.infrastructure.storage;

public class StoredFile {

    private final String url;
    private final String relativePath;

    public StoredFile(String url, String relativePath) {
        this.url = url;
        this.relativePath = relativePath;
    }

    public String getUrl() {
        return url;
    }

    public String getRelativePath() {
        return relativePath;
    }
}
