package com.gestionstock.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "mouvement")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"produit", "utilisateur"})
public class Mouvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // ENTREE, SORTIE, TRANSFERT

    @Column(nullable = false)
    private int quantite;

    private LocalDate date;

    private String motif;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    @JsonIgnoreProperties({"mouvements", "hibernateLazyInitializer"})
    private Produit produit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer"})
    private Utilisateur utilisateur;
}
