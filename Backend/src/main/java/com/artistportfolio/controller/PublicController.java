// src/main/java/com/artistportfolio/controller/PublicController.java
package com.artistportfolio.controller;

import com.artistportfolio.service.AdminService;
import com.artistportfolio.service.PublicService; // We will create this
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@CrossOrigin
@AllArgsConstructor
public class PublicController {

    private final PublicService publicService;

    @GetMapping("/services")
    public ResponseEntity<?> getAllServices() {
        return ResponseEntity.ok(publicService.getAllPublicServices());
    }

    // 1. Get all artists for the "Explore Artists" page
    @GetMapping("/artists")
    public ResponseEntity<?> getAllArtists() {
        return ResponseEntity.ok(publicService.getPublicArtists());
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<?> getPublicServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(publicService.getPublicServiceById(id));
    }

    // 2. Get one artist's full portfolio & services
    @GetMapping("/artists/{id}/portfolio")
    public ResponseEntity<?> getArtistPortfolio(@PathVariable Long id) {
        return ResponseEntity.ok(publicService.getArtistFullDetails(id));
    }

    // 3. Get top rated services for the landing page
    @GetMapping("/services/top")
    public ResponseEntity<?> getTopServices() {
        return ResponseEntity.ok(publicService.getTopRatedServices());
    }
}