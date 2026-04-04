package com.artistportfolio.dto;

import lombok.Data;

public class ProfileDtos {

    @Data
    public static class ProfileResponse {
        public String username;
        public String phoneNumber;
        public String bio;
        public String facebook;
        public String instagram;
        public String twitter;
        public String profilePictureUrl;

        public String gcashName;
        public String gcashNumber;
        public String paymayaName;
        public String paymayaNumber;
    }

    @Data
    public static class ProfileUpdateRequest {
        public String username;
        public String phoneNumber;
        public String bio;
        public String facebook;
        public String instagram;
        public String twitter;

        public String gcashName;
        public String gcashNumber;
        public String paymayaName;
        public String paymayaNumber;
    }
}
