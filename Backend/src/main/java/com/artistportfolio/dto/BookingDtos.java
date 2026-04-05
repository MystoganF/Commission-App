package com.artistportfolio.dto;

import com.artistportfolio.entity.Booking;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

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

        // ── ADD THESE TO REMOVE THE RED SQUIGGLES ──
        public String serviceSample;
        public String paymentStatus;
        public String gcashName;
        public String gcashNumber;
        public String paymayaName;
        public String paymayaNumber;
        public List<PaymentDto> paymentHistory;

        @Data
        public static class PaymentDto {
            public String referenceId;
            public String proofImageUrl;
            public LocalDateTime submittedAt;
        }
    }
}
