package com.artistportfolio.dto;

import com.artistportfolio.entity.Booking;
import lombok.Data;

import java.time.LocalDateTime;

public class BookingDtos {

    @Data
    public static class BookingRequest {
        public Long serviceId;
        public String details;
    }

    @Data
    public static class StatusUpdateRequest {
        public Booking.BookingStatus status;
    }

    @Data
    public static class BookingResponse {
        public Long id;
        public String clientName;
        public String clientEmail;
        public String serviceName;
        public Long serviceId;
        public String artistName;
        public Long artistId;
        public String price;
        public String status;
        public String details;
        public String referenceImageUrl;
        public LocalDateTime createdAt;
        public String serviceSample;
    }
}
