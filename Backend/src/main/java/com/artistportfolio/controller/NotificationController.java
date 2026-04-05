package com.artistportfolio.controller;

import com.artistportfolio.entity.User;
import com.artistportfolio.repository.NotificationRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
@AllArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepo;

    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        // 1. Safety check: Ensure the user is actually logged in and parsed by the JWT Filter
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body("Unauthorized or Invalid Token");
        }

        // 2. Safely cast the principal to your User entity
        User user = (User) authentication.getPrincipal();

        // 3. Fetch notifications using the User's ID
        return ResponseEntity.ok(notificationRepo.findByRecipientIdOrderByCreatedAtDesc(user.getId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationRepo.findById(id).ifPresent(n -> {
            n.setRead(true); // Updates the boolean in the database
            notificationRepo.save(n);
        });
        return ResponseEntity.ok().build();
    }
}