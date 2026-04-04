package com.artistportfolio.controller;

import com.artistportfolio.dto.BookingDtos.*;
import com.artistportfolio.dto.ProfileDtos.*;
import com.artistportfolio.dto.ServiceDtos.*;
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

    // ── Stats ──────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getStats(artist));
    }

    // ── Portfolio ──────────────────────────────────────────

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
            @RequestParam MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(adminService.addWork(artist, title, category, year, file));
    }

    @DeleteMapping("/portfolio/{id}")
    public ResponseEntity<?> deleteWork(
            @AuthenticationPrincipal User artist,
            @PathVariable Long id
    ) {
        adminService.deleteWork(artist, id);
        return ResponseEntity.noContent().build();
    }

    // ── Services ───────────────────────────────────────────

    @GetMapping("/services")
    public ResponseEntity<?> getServices(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getServices(artist));
    }

    @PostMapping("/services")
    public ResponseEntity<?> createService(
            @AuthenticationPrincipal User artist,
            @RequestBody ServiceRequest req
    ) {
        return ResponseEntity.ok(adminService.createService(artist, req));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<?> updateService(
            @AuthenticationPrincipal User artist,
            @PathVariable Long id,
            @RequestBody ServiceRequest req
    ) {
        return ResponseEntity.ok(adminService.updateService(artist, id, req));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<?> deleteService(
            @AuthenticationPrincipal User artist,
            @PathVariable Long id
    ) {
        adminService.deleteService(artist, id);
        return ResponseEntity.noContent().build();
    }

    // ── Bookings ───────────────────────────────────────────

    @GetMapping("/bookings")
    public ResponseEntity<?> getBookings(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getBookings(artist));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @AuthenticationPrincipal User artist,
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest req
    ) {
        return ResponseEntity.ok(adminService.updateBookingStatus(artist, id, req));
    }

    // ── Profile ────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User artist) {
        return ResponseEntity.ok(adminService.getProfile(artist));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal User artist,
            @RequestBody ProfileUpdateRequest req
    ) {
        return ResponseEntity.ok(adminService.updateProfile(artist, req));
    }
}