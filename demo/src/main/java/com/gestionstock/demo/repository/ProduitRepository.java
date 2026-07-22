package com.gestionstock.demo.repository;

import com.gestionstock.demo.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProduitRepository extends JpaRepository<Produit, Long> {

    @Query("SELECT p FROM Produit p WHERE p.quantite <= p.seuilMinimum")
    List<Produit> findProduitsSousSeuil();

    List<Produit> findByCategorie(String categorie);
}
