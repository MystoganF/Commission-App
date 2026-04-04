package com.artistportfolio.controller;

import com.artistportfolio.dto.BookingDtos.*;
import com.artistportfolio.dto.ProfileDtos.*;
import com.artistportfolio.dto.ServiceDtos.*;
import com.artistportfolio.dto.ResumeDtos.*; // <-- New Import
import com.artistportfolio.entity.User;
import com.artistportfolio.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ── Existing Endpoints (Stats, Portfolio, Services, Bookings, Profile) ──
    // (I kept these exactly the same)

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getStats(artist));
    }

    @GetMapping("/portfolio")
    public ResponseEntity<?> getPortfolio(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getPortfolio(artist));
    }

    @PostMapping("/portfolio")
    public ResponseEntity<?> addWork(
            @AuthenticationPrincipal User artist,
            @RequestParam String title,
            @RequestParam String category,
            @RequestParam String year,
            @RequestParam(required = false) String description, // <-- ADDED THIS
            @RequestParam MultipartFile file
    ) throws Exception {
        // Pass the description to the service
        return ResponseEntity.ok(adminService.addWork(artist, title, category, year, description, file));
    }

    @DeleteMapping("/portfolio/{id}")
    public ResponseEntity<?> deleteWork(@AuthenticationPrincipal User artist, @PathVariable Long id) {
        adminService.deleteWork(artist, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/services")
    public ResponseEntity<?> getServices(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getServices(artist));
    }

    @PostMapping("/services")
    public ResponseEntity<?> createService(@AuthenticationPrincipal User artist, @RequestBody ServiceRequest req) {
        return ResponseEntity.ok(adminService.createService(artist, req));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<?> updateService(@AuthenticationPrincipal User artist, @PathVariable Long id, @RequestBody ServiceRequest req) {
        return ResponseEntity.ok(adminService.updateService(artist, id, req));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<?> deleteService(@AuthenticationPrincipal User artist, @PathVariable Long id) {
        adminService.deleteService(artist, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getBookings(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getBookings(artist));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<?> updateBookingStatus(@AuthenticationPrincipal User artist, @PathVariable Long id, @RequestBody StatusUpdateRequest req) {
        return ResponseEntity.ok(adminService.updateBookingStatus(artist, id, req));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getProfile(artist));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User artist, @RequestBody ProfileUpdateRequest req) {
        return ResponseEntity.ok(adminService.updateProfile(artist, req));
    }

    // ── NEW: Resume / LinkedIn Features Endpoints ───────────────────────────

    // Skills
    @GetMapping("/skills")
    public ResponseEntity<?> getSkills(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getSkills(artist));
    }
    @PostMapping("/skills")
    public ResponseEntity<?> addSkill(@AuthenticationPrincipal User artist, @RequestBody SkillDto req) {
        return ResponseEntity.ok(adminService.addSkill(artist, req));
    }
    @DeleteMapping("/skills/{id}")
    public ResponseEntity<?> deleteSkill(@AuthenticationPrincipal User artist, @PathVariable Long id) {
        adminService.deleteSkill(artist, id);
        return ResponseEntity.noContent().build();
    }

    // Experience
    @GetMapping("/experiences")
    public ResponseEntity<?> getExperiences(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getExperiences(artist));
    }
    @PostMapping("/experiences")
    public ResponseEntity<?> addExperience(@AuthenticationPrincipal User artist, @RequestBody ExperienceDto req) {
        return ResponseEntity.ok(adminService.addExperience(artist, req));
    }
    @DeleteMapping("/experiences/{id}")
    public ResponseEntity<?> deleteExperience(@AuthenticationPrincipal User artist, @PathVariable Long id) {
        adminService.deleteExperience(artist, id);
        return ResponseEntity.noContent().build();
    }

    // Education
    @GetMapping("/education")
    public ResponseEntity<?> getEducation(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getEducation(artist));
    }
    @PostMapping("/education")
    public ResponseEntity<?> addEducation(@AuthenticationPrincipal User artist, @RequestBody EducationDto req) {
        return ResponseEntity.ok(adminService.addEducation(artist, req));
    }
    @DeleteMapping("/education/{id}")
    public ResponseEntity<?> deleteEducation(@AuthenticationPrincipal User artist, @PathVariable Long id) {
        adminService.deleteEducation(artist, id);
        return ResponseEntity.noContent().build();
    }

    // Achievements
    @GetMapping("/achievements")
    public ResponseEntity<?> getAchievements(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getAchievements(artist));
    }
    @PostMapping("/achievements")
    public ResponseEntity<?> addAchievement(@AuthenticationPrincipal User artist, @RequestBody AchievementDto req) {
        return ResponseEntity.ok(adminService.addAchievement(artist, req));
    }
    @DeleteMapping("/achievements/{id}")
    public ResponseEntity<?> deleteAchievement(@AuthenticationPrincipal User artist, @PathVariable Long id) {
        adminService.deleteAchievement(artist, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/portfolio/{id}")
    public ResponseEntity<?> updateWork(
            @AuthenticationPrincipal User artist,
            @PathVariable Long id,
            @RequestBody com.artistportfolio.dto.PortfolioDtos.WorkRequest req) {
        return ResponseEntity.ok(adminService.updateWork(artist, id, req.title, req.category, req.year, req.description));
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<?> updateProfilePicture(
            @AuthenticationPrincipal User artist,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(adminService.updateProfilePicture(artist, file));
    }
}