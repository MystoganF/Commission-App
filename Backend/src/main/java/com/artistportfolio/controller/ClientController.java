package com.artistportfolio.controller;

import com.artistportfolio.dto.BookingDtos;
import com.artistportfolio.dto.BookingDtos.BookingRequest;
import com.artistportfolio.entity.User;
import com.artistportfolio.service.ClientService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/client")
@CrossOrigin
@AllArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @PostMapping(value = "/bookings", consumes = {"multipart/form-data"})
    public ResponseEntity<BookingDtos.BookingResponse> createBooking(
            @AuthenticationPrincipal User user,
            @RequestParam Long serviceId,
            @RequestParam String details,
            @RequestParam(required = false) MultipartFile file,        // Instructions Image
            @RequestParam(required = false) String paymentReference,   // New: Ref ID
            @RequestParam(required = false) MultipartFile paymentFile  // New: Payment Proof
    ) throws Exception {
        // We are now passing 6 arguments to match the new Service signature
        BookingDtos.BookingResponse response = clientService.createBooking(
                user,
                serviceId,
                details,
                file,
                paymentReference,
                paymentFile
        );
        return ResponseEntity.ok(response);
    }

    // 2. View personal booking history
    @GetMapping("/bookings")
    public ResponseEntity<?> getMyBookings(@AuthenticationPrincipal User client) {
        return ResponseEntity.ok(clientService.getMyBookings(client));
    }

    // ── PROFILE ENDPOINTS ──

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User client) {
        return ResponseEntity.ok(clientService.getProfile(client));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal User client,
            @RequestBody com.artistportfolio.dto.ProfileDtos.ProfileUpdateRequest req) {
        return ResponseEntity.ok(clientService.updateProfile(client, req));
    }

    @PostMapping(value = "/profile/picture", consumes = {"multipart/form-data"}) // Added consumes
    public ResponseEntity<?> updateProfilePicture(
            @AuthenticationPrincipal User client,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(clientService.updateProfilePicture(client, file));
    }
}