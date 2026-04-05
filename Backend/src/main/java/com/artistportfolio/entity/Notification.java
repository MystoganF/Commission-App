package com.artistportfolio.entity;

import com.fasterxml.jackson.annotation.JsonIgnore; // ── ADD THIS IMPORT ──
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private String link;

    @Column(name = "is_read")
    private boolean read = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonIgnore // ── ADD THIS ANNOTATION ──
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User recipient;
}