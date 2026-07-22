package com.gestionstock.demo.repository;

import com.gestionstock.demo.entity.Mouvement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MouvementRepository extends JpaRepository<Mouvement, Long> {

    List<Mouvement> findByProduitId(Long produitId);

    List<Mouvement> findByDateBetween(LocalDate debut, LocalDate fin);

    List<Mouvement> findByType(String type);

    long countByType(String type);

    List<Mouvement> findByDateAfter(LocalDate date);
}
