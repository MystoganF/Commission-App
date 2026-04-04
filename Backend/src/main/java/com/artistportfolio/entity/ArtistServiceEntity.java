package com.artistportfolio.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "services")
public class ArtistServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String price;
    private String turnaround;

    @Column(length = 1000)
    private String description;

    // Stored as comma-separated string, mapped to List
    @ElementCollection
    @CollectionTable(name = "service_samples", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "sample")
    private List<String> samples;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    private User artist;
}