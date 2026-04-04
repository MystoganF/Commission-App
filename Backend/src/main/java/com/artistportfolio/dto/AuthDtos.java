package com.artistportfolio.dto;

import com.artistportfolio.entity.Booking.BookingStatus;
import lombok.Data;
import com.artistportfolio.dto.AuthDtos.*;
import java.time.LocalDateTime;
import java.util.List;

// ─── Auth ──────────────────────────────────────────────────

public class AuthDtos {

    @Data
    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;
        public String phoneNumber;
        public String facebook;
        public String instagram;
        public String twitter;
        public String role;   // "ADMIN" | "CLIENT"
    }

    @Data
    public static class LoginRequest {
        public String email;
        public String password;
    }

    @Data
    public static class AuthResponse {
        public String token;
        public String role;
        public AuthResponse(String token, String role) {
            this.token = token;
            this.role  = role;
        }
    }
}

// ─── Portfolio ─────────────────────────────────────────────

// ─── Services ──────────────────────────────────────────────

// ─── Bookings ──────────────────────────────────────────────

// ─── Profile ───────────────────────────────────────────────

// ─── Stats ─────────────────────────────────────────────────

