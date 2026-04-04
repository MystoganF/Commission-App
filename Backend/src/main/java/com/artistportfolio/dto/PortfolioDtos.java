package com.artistportfolio.dto;

import lombok.Data;

import java.time.LocalDateTime;

public class PortfolioDtos {

    @Data
    public static class WorkResponse {
        public Long   id;
        public String title;
        public String category;
        public String year;
        public String imageUrl;
        public LocalDateTime createdAt;
    }
}
