package com.artistportfolio.dto;

import lombok.Data;

public class StatsDtos {

    @Data
    public static class StatsResponse {
        public long totalWorks;
        public long totalServices;
        public long totalBookings;
        public long pendingCount;
    }
}
