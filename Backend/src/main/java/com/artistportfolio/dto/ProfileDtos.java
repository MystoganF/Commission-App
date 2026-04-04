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
    }

    @Data
    public static class ProfileUpdateRequest {
        public String username;
        public String phoneNumber;
        public String bio;
        public String facebook;
        public String instagram;
        public String twitter;
    }
}
