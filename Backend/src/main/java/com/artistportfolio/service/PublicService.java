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
    private final SkillRepository skillRepo;
    private final ExperienceRepository experienceRepo;
    private final EducationRepository educationRepo;
    private final AchievementRepository achievementRepo;

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

        if (!service.isActive()) {
            throw new RuntimeException("This service is no longer available.");
        }
        return toPublicServiceDto(service);
    }

    @Transactional(readOnly = true)
    public ArtistFullPortfolioDto getArtistFullDetails(Long artistId) {
        User artist = userRepo.findById(artistId).orElseThrow(() -> new RuntimeException("Artist not found"));
        ArtistFullPortfolioDto dto = new ArtistFullPortfolioDto();

        dto.profile = toPublicArtistDto(artist);

        // ── WORKS ──
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

        // ── SERVICES (ONLY ACTIVE) ──
        // This is the only place we assign services. No duplicates!
        dto.services = serviceRepo.findByArtistIdAndActiveTrue(artistId).stream()
                .map(this::toPublicServiceDto)
                .collect(Collectors.toList());

        // ── REVIEWS ──
        List<Review> reviews = reviewRepo.findByArtistId(artistId);
        dto.reviews = (reviews != null) ? reviews.stream().map(r -> {
            ReviewResponse res = new ReviewResponse();
            res.clientName = r.getClient() != null ? r.getClient().getUsername() : "Anonymous";
            res.rating = r.getRating();
            res.comment = r.getComment();
            res.date = r.getCreatedAt().toLocalDate().toString();
            return res;
        }).collect(Collectors.toList()) : new ArrayList<>();

        // ── RESUME DATA ──
        dto.experiences = experienceRepo.findByArtistIdOrderByStartDateDesc(artistId).stream().map(e -> {
            ResumeDtos.ExperienceDto res = new ResumeDtos.ExperienceDto();
            res.id = e.getId(); res.title = e.getTitle(); res.company = e.getCompany();
            res.startDate = e.getStartDate(); res.endDate = e.getEndDate(); res.description = e.getDescription();
            return res;
        }).collect(Collectors.toList());

        dto.education = educationRepo.findByArtistIdOrderByEndYearDesc(artistId).stream().map(e -> {
            ResumeDtos.EducationDto res = new ResumeDtos.EducationDto();
            res.id = e.getId(); res.degree = e.getDegree(); res.institution = e.getInstitution();
            res.startYear = e.getStartYear(); res.endYear = e.getEndYear(); res.imageUrl = e.getImageUrl();
            return res;
        }).collect(Collectors.toList());

        dto.achievements = achievementRepo.findByArtistIdOrderByYearDesc(artistId).stream().map(a -> {
            ResumeDtos.AchievementDto res = new ResumeDtos.AchievementDto();
            res.id = a.getId(); res.title = a.getTitle(); res.year = a.getYear();
            res.description = a.getDescription(); res.imageUrl = a.getImageUrl();
            return res;
        }).collect(Collectors.toList());

        return dto;
    }

    @Transactional(readOnly = true)
    public List<PublicServiceDto> getTopRatedServices() {
        return serviceRepo.findByActiveTrue().stream()
                .map(this::toPublicServiceDto)
                .sorted((a, b) -> Double.compare(b.averageRating, a.averageRating))
                .limit(6)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PublicServiceDto> getAllPublicServices() {
        return serviceRepo.findByActiveTrue().stream()
                .map(this::toPublicServiceDto)
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
        dto.gcashName = u.getGcashName();
        dto.gcashNumber = u.getGcashNumber();
        dto.paymayaName = u.getPaymayaName();
        dto.paymayaNumber = u.getPaymayaNumber();

        List<Skill> skillEntities = skillRepo.findByArtistId(u.getId());
        dto.skills = (skillEntities != null) ? skillEntities.stream().map(Skill::getName).collect(Collectors.toList()) : new ArrayList<>();

        List<Review> reviews = reviewRepo.findByArtistId(u.getId());
        dto.totalReviews = (reviews != null) ? reviews.size() : 0;
        dto.averageRating = (dto.totalReviews > 0) ? reviews.stream().mapToInt(Review::getRating).average().orElse(0.0) : 0.0;
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

        // ── CRITICAL FIX: Map the active field! ──
        dto.active = s.isActive();

        dto.gcashName = s.getArtist().getGcashName();
        dto.gcashNumber = s.getArtist().getGcashNumber();
        dto.paymayaName = s.getArtist().getPaymayaName();
        dto.paymayaNumber = s.getArtist().getPaymayaNumber();

        List<Review> reviews = reviewRepo.findByServiceId(s.getId());
        dto.averageRating = (reviews != null && !reviews.isEmpty()) ? reviews.stream().mapToInt(Review::getRating).average().orElse(0.0) : 0.0;
        return dto;
    }
}