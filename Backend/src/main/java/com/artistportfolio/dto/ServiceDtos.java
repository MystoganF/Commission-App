package com.artistportfolio.dto;

import lombok.Data;

import java.util.List;

public class ServiceDtos {

    @Data
    public static class ServiceRequest {
        public String name;
        public String price; // We will handle the number validation on frontend
        public String turnaround;
        public String description;
        public List<String> samples; // Now stores Image URLs
        public List<String> skills;  // <-- NEW: Stores selected skill names
    }

    @Data
    public static class ServiceResponse {
        public Long id;
        public String name;
        public String price;
        public String turnaround;
        public String description;
        public List<String> samples;
        public List<String> skills; // <-- NEW
    }

}
