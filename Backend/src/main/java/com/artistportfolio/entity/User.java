package com.artistportfolio.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Profile
    @Column(length = 500)
    private String bio;

    // Social links
    private String facebook;
    private String instagram;
    private String twitter;

    public enum Role { CLIENT, ADMIN }

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;
}