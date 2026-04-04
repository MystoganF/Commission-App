package com.artistportfolio.repository;
import com.artistportfolio.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByArtistId(Long artistId);
}