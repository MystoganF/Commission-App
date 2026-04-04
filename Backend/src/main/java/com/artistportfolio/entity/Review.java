// src/main/java/com/artistportfolio/entity/Review.java
package com.artistportfolio.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rating; // 1 to 5
    private String comment;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client; // The person giving the review

    @ManyToOne
    @JoinColumn(name = "artist_id")
    private User artist; // If reviewing the artist directly

    @ManyToOne
    @JoinColumn(name = "service_id")
    private ArtistServiceEntity service; // If reviewing a specific service

    private LocalDateTime createdAt = LocalDateTime.now();
}