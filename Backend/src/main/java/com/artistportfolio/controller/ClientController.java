package com.artistportfolio.controller;

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
    public ResponseEntity<?> createBooking(
            @AuthenticationPrincipal User client,
            @RequestParam Long serviceId,
            @RequestParam String details,
            @RequestParam(required = false) MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(clientService.createBooking(client, serviceId, details, file));
    }

    // 2. View personal booking history
    @GetMapping("/bookings")
    public ResponseEntity<?> getMyBookings(@AuthenticationPrincipal User client) {
        return ResponseEntity.ok(clientService.getMyBookings(client));
    }
}