package com.artistportfolio.service;

import com.artistportfolio.dto.BookingDtos.*;
import com.artistportfolio.dto.PortfolioDtos.*;
import com.artistportfolio.dto.ProfileDtos.*;
import com.artistportfolio.dto.ServiceDtos.*;
import com.artistportfolio.dto.StatsDtos.*;
import com.artistportfolio.dto.ResumeDtos.*;
import com.artistportfolio.entity.*;
import com.artistportfolio.entity.Booking.BookingStatus;
import com.artistportfolio.repository.*;
import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AdminService {

    private final UserRepository          userRepo;
    private final PortfolioWorkRepository workRepo;
    private final ArtistServiceRepository serviceRepo;
    private final BookingRepository       bookingRepo;
    private final SkillRepository         skillRepo;
    private final ExperienceRepository    experienceRepo;
    private final EducationRepository     educationRepo;
    private final AchievementRepository   achievementRepo;

    private final SupabaseService supabaseService;

    public StatsResponse getStats(User artist) {
        StatsResponse res = new StatsResponse();
        res.totalWorks    = workRepo.countByArtistId(artist.getId());
        res.totalServices = serviceRepo.countByArtistId(artist.getId());
        res.totalBookings = bookingRepo.countByServiceArtistId(artist.getId());
        res.pendingCount  = bookingRepo.countByServiceArtistIdAndStatus(artist.getId(), BookingStatus.PENDING);
        return res;
    }

    public List<WorkResponse> getPortfolio(User artist) {
        return workRepo.findByArtistIdOrderByCreatedAtDesc(artist.getId())
                .stream().map(this::toWorkResponse).collect(Collectors.toList());
    }

    public WorkResponse addWork(User artist, String title, String category,
                                String year, String description, MultipartFile file) throws IOException {
        String imageUrl = supabaseService.uploadFile(file);
        PortfolioWork work = new PortfolioWork();
        work.setTitle(title);
        work.setCategory(category);
        work.setYear(year);
        work.setDescription(description);
        work.setImageUrl(imageUrl);
        work.setArtist(artist);
        return toWorkResponse(workRepo.save(work));
    }

    public WorkResponse updateWork(User artist, Long workId, String title, String category, String year, String description) {
        PortfolioWork work = workRepo.findById(workId).orElseThrow(() -> new RuntimeException("Work not found."));
        if (!work.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized.");
        work.setTitle(title);
        work.setCategory(category);
        work.setYear(year);
        work.setDescription(description);
        return toWorkResponse(workRepo.save(work));
    }

    public void deleteWork(User artist, Long workId) {
        PortfolioWork work = workRepo.findById(workId).orElseThrow(() -> new RuntimeException("Work not found."));
        if (!work.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized.");
        workRepo.delete(work);
    }

    public List<ServiceResponse> getServices(User artist) {
        return serviceRepo.findByArtistId(artist.getId())
                .stream().map(this::toServiceResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(User artist, Long id) {
        ArtistServiceEntity s = serviceRepo.findById(id).orElseThrow(() -> new RuntimeException("Service not found."));
        if (!s.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized.");
        return toServiceResponse(s);
    }

    public ServiceResponse createService(User artist, ServiceRequest req) {
        ArtistServiceEntity s = new ArtistServiceEntity();
        s.setName(req.name);
        s.setPrice(req.price);
        s.setTurnaround(req.turnaround);
        s.setDescription(req.description);
        s.setSamples(req.samples);
        s.setSkills(req.skills);
        s.setArtist(artist);
        return toServiceResponse(serviceRepo.save(s));
    }

    public ServiceResponse updateService(User artist, Long id, ServiceRequest req) {
        ArtistServiceEntity s = serviceRepo.findById(id).orElseThrow(() -> new RuntimeException("Service not found."));
        if (!s.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized.");
        s.setName(req.name);
        s.setPrice(req.price);
        s.setTurnaround(req.turnaround);
        s.setDescription(req.description);
        s.setSamples(req.samples);
        s.setSkills(req.skills);
        return toServiceResponse(serviceRepo.save(s));
    }

    public void deleteService(User artist, Long id) {
        ArtistServiceEntity s = serviceRepo.findById(id).orElseThrow(() -> new RuntimeException("Service not found."));
        if (!s.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized.");
        serviceRepo.delete(s);
    }

    public List<BookingResponse> getBookings(User artist) {
        return bookingRepo.findByServiceArtistIdOrderByCreatedAtDesc(artist.getId())
                .stream().map(this::toBookingResponse).collect(Collectors.toList());
    }

    public BookingResponse updateBookingStatus(User artist, Long bookingId, StatusUpdateRequest req) {
        Booking booking = bookingRepo.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found."));
        if (!booking.getService().getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized.");
        booking.setStatus(req.status);
        return toBookingResponse(bookingRepo.save(booking));
    }

    public ProfileResponse getProfile(User artist) {
        ProfileResponse res = new ProfileResponse();
        res.username    = artist.getUsername();
        res.phoneNumber = artist.getPhoneNumber();
        res.bio         = artist.getBio();
        res.facebook    = artist.getFacebook();
        res.instagram   = artist.getInstagram();
        res.twitter     = artist.getTwitter();
        res.profilePictureUrl = artist.getProfilePictureUrl();
        // ── MAP THE NEW FIELDS ──
        res.gcashName = artist.getGcashName();
        res.gcashNumber = artist.getGcashNumber();
        res.paymayaName = artist.getPaymayaName();
        res.paymayaNumber = artist.getPaymayaNumber();
        return res;
    }

    public ProfileResponse updateProfile(User artist, ProfileUpdateRequest req) {
        artist.setUsername(req.username);
        artist.setPhoneNumber(req.phoneNumber);
        artist.setBio(req.bio);
        artist.setFacebook(req.facebook);
        artist.setInstagram(req.instagram);
        artist.setTwitter(req.twitter);
        // ── SAVE THE NEW FIELDS ──
        artist.setGcashName(req.gcashName);
        artist.setGcashNumber(req.gcashNumber);
        artist.setPaymayaName(req.paymayaName);
        artist.setPaymayaNumber(req.paymayaNumber);
        return getProfile(userRepo.save(artist));
    }

    public ProfileResponse updateProfilePicture(User artist, MultipartFile file) throws IOException {
        String imageUrl = supabaseService.uploadFile(file);
        artist.setProfilePictureUrl(imageUrl);
        return getProfile(userRepo.save(artist));
    }

    // ── Skills & Experience ──
    public List<SkillDto> getSkills(User artist) {
        return skillRepo.findByArtistId(artist.getId()).stream().map(s -> {
            SkillDto dto = new SkillDto(); dto.id = s.getId(); dto.name = s.getName(); return dto;
        }).collect(Collectors.toList());
    }
    public SkillDto addSkill(User artist, SkillDto req) {
        Skill s = new Skill(); s.setName(req.name); s.setArtist(artist);
        s = skillRepo.save(s);
        SkillDto dto = new SkillDto(); dto.id = s.getId(); dto.name = s.getName(); return dto;
    }
    public void deleteSkill(User artist, Long id) {
        Skill s = skillRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!s.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized");
        skillRepo.delete(s);
    }

    public List<ExperienceDto> getExperiences(User artist) {
        return experienceRepo.findByArtistIdOrderByStartDateDesc(artist.getId()).stream().map(e -> {
            ExperienceDto dto = new ExperienceDto();
            dto.id = e.getId(); dto.title = e.getTitle(); dto.company = e.getCompany();
            dto.startDate = e.getStartDate(); dto.endDate = e.getEndDate(); dto.description = e.getDescription();
            return dto;
        }).collect(Collectors.toList());
    }
    public ExperienceDto addExperience(User artist, ExperienceDto req) {
        Experience e = new Experience();
        e.setTitle(req.title); e.setCompany(req.company); e.setStartDate(req.startDate);
        e.setEndDate(req.endDate); e.setDescription(req.description); e.setArtist(artist);
        e = experienceRepo.save(e);
        req.id = e.getId(); return req;
    }
    public ExperienceDto updateExperience(User artist, Long id, ExperienceDto req) {
        Experience e = experienceRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!e.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized");
        e.setTitle(req.title); e.setCompany(req.company); e.setStartDate(req.startDate);
        e.setEndDate(req.endDate); e.setDescription(req.description);
        experienceRepo.save(e);
        req.id = e.getId(); return req;
    }
    public void deleteExperience(User artist, Long id) {
        Experience e = experienceRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!e.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized");
        experienceRepo.delete(e);
    }

    // ── NEW: Education ──
    public List<EducationDto> getEducation(User artist) {
        return educationRepo.findByArtistIdOrderByEndYearDesc(artist.getId()).stream()
                .map(this::mapToEducationDto).collect(Collectors.toList());
    }
    public EducationDto addEducation(User artist, String degree, String institution, String startYear, String endYear, MultipartFile file) throws Exception {
        Education e = new Education();
        e.setDegree(degree); e.setInstitution(institution);
        e.setStartYear(startYear); e.setEndYear(endYear); e.setArtist(artist);
        if (file != null && !file.isEmpty()) e.setImageUrl(supabaseService.uploadFile(file));
        return mapToEducationDto(educationRepo.save(e));
    }
    public EducationDto updateEducation(User artist, Long id, String degree, String institution, String startYear, String endYear, MultipartFile file) throws Exception {
        Education e = educationRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!e.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized");
        e.setDegree(degree); e.setInstitution(institution);
        e.setStartYear(startYear); e.setEndYear(endYear);
        if (file != null && !file.isEmpty()) e.setImageUrl(supabaseService.uploadFile(file));
        return mapToEducationDto(educationRepo.save(e));
    }
    public void deleteEducation(User artist, Long id) {
        Education e = educationRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!e.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized");
        educationRepo.delete(e);
    }

    // ── NEW: Achievements ──
    public List<AchievementDto> getAchievements(User artist) {
        return achievementRepo.findByArtistIdOrderByYearDesc(artist.getId()).stream()
                .map(this::mapToAchievementDto).collect(Collectors.toList());
    }
    public AchievementDto addAchievement(User artist, String title, String year, String description, MultipartFile file) throws Exception {
        Achievement a = new Achievement();
        a.setTitle(title); a.setYear(year); a.setDescription(description); a.setArtist(artist);
        if (file != null && !file.isEmpty()) a.setImageUrl(supabaseService.uploadFile(file));
        return mapToAchievementDto(achievementRepo.save(a));
    }
    public AchievementDto updateAchievement(User artist, Long id, String title, String year, String description, MultipartFile file) throws Exception {
        Achievement a = achievementRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!a.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized");
        a.setTitle(title); a.setYear(year); a.setDescription(description);
        if (file != null && !file.isEmpty()) a.setImageUrl(supabaseService.uploadFile(file));
        return mapToAchievementDto(achievementRepo.save(a));
    }
    public void deleteAchievement(User artist, Long id) {
        Achievement a = achievementRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!a.getArtist().getId().equals(artist.getId())) throw new RuntimeException("Unauthorized");
        achievementRepo.delete(a);
    }

    // ── Helpers ──
    private WorkResponse toWorkResponse(PortfolioWork w) {
        WorkResponse r = new WorkResponse();
        r.id = w.getId(); r.title = w.getTitle(); r.category = w.getCategory();
        r.year = w.getYear(); r.description = w.getDescription(); r.imageUrl = w.getImageUrl();
        r.createdAt = w.getCreatedAt();
        return r;
    }
    private ServiceResponse toServiceResponse(ArtistServiceEntity s) {
        ServiceResponse r = new ServiceResponse();
        r.id = s.getId(); r.name = s.getName(); r.price = s.getPrice();
        r.turnaround = s.getTurnaround(); r.description = s.getDescription();
        r.samples = s.getSamples() != null ? new java.util.ArrayList<>(s.getSamples()) : new java.util.ArrayList<>();
        r.skills = s.getSkills() != null ? new java.util.ArrayList<>(s.getSkills()) : new java.util.ArrayList<>();
        return r;
    }
    private BookingResponse toBookingResponse(Booking b) {
        BookingResponse r = new BookingResponse(); r.id = b.getId(); r.clientName = b.getClient().getUsername();
        r.clientEmail = b.getClient().getEmail(); r.serviceName = b.getService().getName(); r.price = b.getService().getPrice();
        r.status = b.getStatus().name(); r.createdAt = b.getCreatedAt();
        return r;
    }
    private EducationDto mapToEducationDto(Education e) {
        EducationDto dto = new EducationDto();
        dto.id = e.getId(); dto.degree = e.getDegree(); dto.institution = e.getInstitution();
        dto.startYear = e.getStartYear(); dto.endYear = e.getEndYear(); dto.imageUrl = e.getImageUrl();
        return dto;
    }
    private AchievementDto mapToAchievementDto(Achievement a) {
        AchievementDto dto = new AchievementDto();
        dto.id = a.getId(); dto.title = a.getTitle(); dto.year = a.getYear();
        dto.description = a.getDescription(); dto.imageUrl = a.getImageUrl();
        return dto;
    }
}