package com.artistportfolio.service;

import com.artistportfolio.dto.PublicDtos.*;
import com.artistportfolio.dto.PortfolioDtos;
import com.artistportfolio.dto.ResumeDtos;
import com.artistportfolio.entity.*;
import com.artistportfolio.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PublicService {

    private final UserRepository userRepo;
    private final PortfolioWorkRepository workRepo;
    private final ArtistServiceRepository serviceRepo;
    private final ReviewRepository reviewRepo;

    // Resume & Profile Repositories
    private final SkillRepository skillRepo;
    private final ExperienceRepository experienceRepo;
    private final EducationRepository educationRepo;
    private final AchievementRepository achievementRepo;

    // 1. Get all artists for the "Explore" page
    @Transactional(readOnly = true)
    public List<PublicArtistDto> getPublicArtists() {
        return userRepo.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole().name()))
                .map(this::toPublicArtistDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PublicServiceDto getPublicServiceById(Long id) {
        ArtistServiceEntity service = serviceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        return toPublicServiceDto(service);
    }

    // 2. Get everything for a specific artist's portfolio page
    @Transactional(readOnly = true)
    public ArtistFullPortfolioDto getArtistFullDetails(Long artistId) {
        User artist = userRepo.findById(artistId).orElseThrow(() -> new RuntimeException("Artist not found"));

        ArtistFullPortfolioDto dto = new ArtistFullPortfolioDto();

        // ── Map Core Profile ──
        dto.profile = toPublicArtistDto(artist);

        // ── Map Works ──
        dto.works = workRepo.findByArtistIdOrderByCreatedAtDesc(artistId).stream()
                .map(w -> {
                    PortfolioDtos.WorkResponse res = new PortfolioDtos.WorkResponse();
                    res.id = w.getId();
                    res.title = w.getTitle();
                    res.imageUrl = w.getImageUrl();
                    res.category = w.getCategory();
                    res.year = w.getYear();
                    res.description = w.getDescription();
                    return res;
                }).collect(Collectors.toList());

        // ── Map Services ──
        dto.services = serviceRepo.findByArtistId(artistId).stream()
                .map(this::toPublicServiceDto).collect(Collectors.toList());

        // ── Map Reviews ──
        List<Review> reviews = reviewRepo.findByArtistId(artistId);
        if (reviews != null) {
            dto.reviews = reviews.stream().map(r -> {
                ReviewResponse res = new ReviewResponse();
                res.clientName = r.getClient().getUsername();
                res.rating = r.getRating();
                res.comment = r.getComment();
                res.date = r.getCreatedAt().toLocalDate().toString();
                return res;
            }).collect(Collectors.toList());
        } else {
            dto.reviews = new ArrayList<>();
        }

        // ── Map Resume & Background (FIXED MAPPINGS) ──
        dto.experiences = experienceRepo.findByArtistIdOrderByStartDateDesc(artistId).stream().map(e -> {
            ResumeDtos.ExperienceDto res = new ResumeDtos.ExperienceDto();
            res.id = e.getId();
            res.title = e.getTitle();
            res.company = e.getCompany();
            res.startDate = e.getStartDate();
            res.endDate = e.getEndDate();
            res.description = e.getDescription();
            return res;
        }).collect(Collectors.toList());

        dto.education = educationRepo.findByArtistIdOrderByEndYearDesc(artistId).stream().map(e -> {
            ResumeDtos.EducationDto res = new ResumeDtos.EducationDto();
            res.id = e.getId();
            res.degree = e.getDegree();
            res.institution = e.getInstitution();
            res.startYear = e.getStartYear();
            res.endYear = e.getEndYear();
            res.imageUrl = e.getImageUrl(); // <── FIXED: Mapping imageUrl
            return res;
        }).collect(Collectors.toList());

        dto.achievements = achievementRepo.findByArtistIdOrderByYearDesc(artistId).stream().map(a -> {
            ResumeDtos.AchievementDto res = new ResumeDtos.AchievementDto();
            res.id = a.getId();
            res.title = a.getTitle();
            res.year = a.getYear();
            res.description = a.getDescription();
            res.imageUrl = a.getImageUrl(); // <── FIXED: Mapping imageUrl
            return res;
        }).collect(Collectors.toList());

        return dto;
    }

    // 3. Get Top Rated Services for Landing Page
    @Transactional(readOnly = true)
    public List<PublicServiceDto> getTopRatedServices() {
        List<ArtistServiceEntity> allServices = serviceRepo.findAll();
        if (allServices == null || allServices.isEmpty()) return new ArrayList<>();

        return allServices.stream()
                .map(this::toPublicServiceDto)
                .sorted((a, b) -> Double.compare(b.getAverageRating(), a.getAverageRating()))
                .limit(6)
                .collect(Collectors.toList());
    }

    private PublicArtistDto toPublicArtistDto(User u) {
        PublicArtistDto dto = new PublicArtistDto();
        dto.id = u.getId();
        dto.username = u.getUsername();
        dto.bio = u.getBio();
        dto.profilePictureUrl = u.getProfilePictureUrl();
        dto.phoneNumber = u.getPhoneNumber();
        dto.facebook = u.getFacebook();
        dto.instagram = u.getInstagram();
        dto.twitter = u.getTwitter();

        // ── ADD THESE 4 LINES ──
        dto.gcashName = u.getGcashName();
        dto.gcashNumber = u.getGcashNumber();
        dto.paymayaName = u.getPaymayaName();
        dto.paymayaNumber = u.getPaymayaNumber();

        // Skills logic
        List<Skill> skillEntities = skillRepo.findByArtistId(u.getId());
        dto.skills = (skillEntities != null)
                ? skillEntities.stream().map(Skill::getName).collect(Collectors.toList())
                : new ArrayList<>();

        // Ratings logic
        List<Review> reviews = reviewRepo.findByArtistId(u.getId());
        dto.totalReviews = (reviews != null) ? reviews.size() : 0;
        dto.averageRating = (dto.totalReviews > 0)
                ? reviews.stream().mapToInt(Review::getRating).average().orElse(0.0)
                : 0.0;

        return dto;
    }
    private PublicServiceDto toPublicServiceDto(ArtistServiceEntity s) {
        PublicServiceDto dto = new PublicServiceDto();
        dto.id = s.getId();
        dto.name = s.getName();
        dto.price = s.getPrice();
        dto.description = s.getDescription();
        dto.turnaround = s.getTurnaround();
        dto.artistName = s.getArtist().getUsername();
        dto.artistId = s.getArtist().getId();
        dto.samples = s.getSamples() != null ? new ArrayList<>(s.getSamples()) : new ArrayList<>();
        dto.skills = s.getSkills() != null ? new ArrayList<>(s.getSkills()) : new ArrayList<>();
        dto.gcashName = s.getArtist().getGcashName();
        dto.gcashNumber = s.getArtist().getGcashNumber();
        dto.paymayaName = s.getArtist().getPaymayaName();
        dto.paymayaNumber = s.getArtist().getPaymayaNumber();

        List<Review> reviews = reviewRepo.findByServiceId(s.getId());
        dto.averageRating = (reviews != null && !reviews.isEmpty())
                ? reviews.stream().mapToInt(Review::getRating).average().orElse(0.0)
                : 0.0;



        return dto;
    }

    @Transactional(readOnly = true)
    public List<PublicServiceDto> getAllPublicServices() {
        List<ArtistServiceEntity> allServices = serviceRepo.findAll();
        if (allServices == null || allServices.isEmpty()) return new ArrayList<>();

        return allServices.stream()
                .map(this::toPublicServiceDto)
                .collect(Collectors.toList());
    }
}