package com.artistportfolio.dto;

import lombok.Data;

public class ResumeDtos {

    @Data
    public static class SkillDto {
        public Long id;
        public String name;
    }

    @Data
    public static class ExperienceDto {
        public Long id;
        public String title;
        public String company;
        public String startDate;
        public String endDate;
        public String description;
    }

    @Data
    public static class EducationDto {
        public Long id;
        public String degree;
        public String institution;
        public String startYear;
        public String endYear;
        public String imageUrl;
    }

    @Data
    public static class AchievementDto {
        public Long id;
        public String title;
        public String year;
        public String description;
        public String imageUrl;
    }
}