package com.artistportfolio.controller;

import com.artistportfolio.dto.BookingDtos.BookingRequest;
import com.artistportfolio.entity.User;
import com.artistportfolio.service.ClientService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/client")
@CrossOrigin
@AllArgsConstructor
public class ClientController {

    private final ClientService clientService;

    // 1. Submit a new booking request
    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(
            @AuthenticationPrincipal User client,
            @RequestBody BookingRequest req) {
        return ResponseEntity.ok(clientService.createBooking(client, req));
    }

    // 2. View personal booking history
    @GetMapping("/bookings")
    public ResponseEntity<?> getMyBookings(@AuthenticationPrincipal User client) {
        return ResponseEntity.ok(clientService.getMyBookings(client));
    }
}