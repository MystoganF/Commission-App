package com.artistportfolio.controller;

import com.artistportfolio.dto.BookingDtos.*;
import com.artistportfolio.dto.ProfileDtos.*;
import com.artistportfolio.dto.ServiceDtos.*;
import com.artistportfolio.dto.ResumeDtos.*;
import com.artistportfolio.entity.User;
import com.artistportfolio.service.AdminService;
import com.artistportfolio.service.SupabaseService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
@AllArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final SupabaseService supabaseService;

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
            @RequestParam(required = false) String description,
            @RequestParam MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(adminService.addWork(artist, title, category, year, description, file));
    }

    @PutMapping("/portfolio/{id}")
    public ResponseEntity<?> updateWork(
            @AuthenticationPrincipal User artist,
            @PathVariable Long id,
            @RequestBody com.artistportfolio.dto.PortfolioDtos.WorkRequest req) {
        return ResponseEntity.ok(adminService.updateWork(artist, id, req.title, req.category, req.year, req.description));
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

    @GetMapping("/services/{id}")
    public ResponseEntity<?> getServiceById(@AuthenticationPrincipal User artist, @PathVariable Long id) {
        return ResponseEntity.ok(adminService.getServiceById(artist, id));
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

    @PostMapping("/profile/picture")
    public ResponseEntity<?> updateProfilePicture(
            @AuthenticationPrincipal User artist,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(adminService.updateProfilePicture(artist, file));
    }

    // ── Skills & Experience ──
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

    @GetMapping("/experiences")
    public ResponseEntity<?> getExperiences(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getExperiences(artist));
    }
    @PostMapping("/experiences")
    public ResponseEntity<?> addExperience(@AuthenticationPrincipal User artist, @RequestBody ExperienceDto req) {
        return ResponseEntity.ok(adminService.addExperience(artist, req));
    }
    @PutMapping("/experiences/{id}")
    public ResponseEntity<?> updateExperience(@AuthenticationPrincipal User artist, @PathVariable Long id, @RequestBody ExperienceDto req) {
        return ResponseEntity.ok(adminService.updateExperience(artist, id, req));
    }
    @DeleteMapping("/experiences/{id}")
    public ResponseEntity<?> deleteExperience(@AuthenticationPrincipal User artist, @PathVariable Long id) {
        adminService.deleteExperience(artist, id);
        return ResponseEntity.noContent().build();
    }

    // ── NEW: Education (Multipart) ──
    @GetMapping("/education")
    public ResponseEntity<?> getEducation(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getEducation(artist));
    }

    @PostMapping("/education")
    public ResponseEntity<?> addEducation(
            @AuthenticationPrincipal User artist,
            @RequestParam String degree,
            @RequestParam String institution,
            @RequestParam String startYear,
            @RequestParam(required = false) String endYear,
            @RequestParam(required = false) MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(adminService.addEducation(artist, degree, institution, startYear, endYear, file));
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<?> updateEducation(
            @AuthenticationPrincipal User artist,
            @PathVariable Long id,
            @RequestParam String degree,
            @RequestParam String institution,
            @RequestParam String startYear,
            @RequestParam(required = false) String endYear,
            @RequestParam(required = false) MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(adminService.updateEducation(artist, id, degree, institution, startYear, endYear, file));
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<?> deleteEducation(@AuthenticationPrincipal User artist, @PathVariable Long id) {
        adminService.deleteEducation(artist, id);
        return ResponseEntity.noContent().build();
    }

    // ── NEW: Achievements (Multipart) ──
    @GetMapping("/achievements")
    public ResponseEntity<?> getAchievements(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getAchievements(artist));
    }

    @PostMapping("/achievements")
    public ResponseEntity<?> addAchievement(
            @AuthenticationPrincipal User artist,
            @RequestParam String title,
            @RequestParam String year,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(adminService.addAchievement(artist, title, year, description, file));
    }

    @PutMapping("/achievements/{id}")
    public ResponseEntity<?> updateAchievement(
            @AuthenticationPrincipal User artist,
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String year,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(adminService.updateAchievement(artist, id, title, year, description, file));
    }

    @DeleteMapping("/achievements/{id}")
    public ResponseEntity<?> deleteAchievement(@AuthenticationPrincipal User artist, @PathVariable Long id) {
        adminService.deleteAchievement(artist, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadGenericImage(@RequestParam("file") MultipartFile file) throws Exception {
        String url = supabaseService.uploadFile(file);
        return ResponseEntity.ok(java.util.Map.of("url", url));
    }
}