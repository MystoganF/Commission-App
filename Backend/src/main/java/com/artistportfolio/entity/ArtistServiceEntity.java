package com.artistportfolio.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
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

    // --- SAMPLES (Stores Supabase Image URLs) ---
    @ElementCollection
    @CollectionTable(name = "service_samples", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "sample_url")
    private List<String> samples = new ArrayList<>();

    // --- SKILLS (Stores related skill names) ---
    @ElementCollection
    @CollectionTable(name = "service_skills", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "skill_name")
    private List<String> skills = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    private User artist;

    // ── SOFT DELETE FLAG ──
    @Column(nullable = false)
    private boolean active = true;
}