package com.artistportfolio.dto;

import lombok.Data;

import java.util.List;

public class ServiceDtos {

    @Data
    public static class ServiceRequest {
        public String       name;
        public String       price;
        public String       turnaround;
        public String       description;
        public List<String> samples;
    }

    @Data
    public static class ServiceResponse {
        public Long         id;
        public String       name;
        public String       price;
        public String       turnaround;
        public String       description;
        public List<String> samples;
    }
}
