package com.artistportfolio.dto;

import lombok.Data;
import java.util.List;

public class PublicDtos {

    @Data
    public static class PublicArtistDto {
        public Long id;
        public String username;
        public String bio;
        public String profilePictureUrl;
        public double averageRating;
        public int totalReviews;
        public List<String> skills;

        // --- Contact & Socials ---
        public String phoneNumber;
        public String facebook;
        public String instagram;
        public String twitter;

        // ── ADD THESE 4 FIELDS ──
        public String gcashName;
        public String gcashNumber;
        public String paymayaName;
        public String paymayaNumber;
    }

    @Data
    public static class PublicServiceDto {
        public Long id;
        public String name;
        public String price;
        public String description;
        public String turnaround; // Turnaround time
        public String artistName;
        public Long artistId;
        public double averageRating;
        public List<String> samples;
        public List<String> skills;

        public String gcashName;
        public String gcashNumber;
        public String paymayaName;
        public String paymayaNumber;

        public boolean active;
    }

    @Data
    public static class ArtistFullPortfolioDto {
        public PublicArtistDto profile;
        public List<PortfolioDtos.WorkResponse> works;
        public List<PublicServiceDto> services;
        public List<ReviewResponse> reviews;

        // --- Resume & Background ---
        public List<ResumeDtos.ExperienceDto> experiences;
        public List<ResumeDtos.EducationDto> education;
        public List<ResumeDtos.AchievementDto> achievements;
    }

    @Data
    public static class ReviewResponse {
        public String clientName;
        public int rating;
        public String comment;
        public String date;
    }
}