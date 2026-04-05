package com.artistportfolio.repository;

import com.artistportfolio.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Gets the user's notifications, newest first
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId);

    // Counts unread notifications for the red badge
    long countByRecipientIdAndReadFalse(Long userId);
}