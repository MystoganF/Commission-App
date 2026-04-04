package com.artistportfolio.repository;
import com.artistportfolio.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByArtistIdOrderByYearDesc(Long artistId);
}