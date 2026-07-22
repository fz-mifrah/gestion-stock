package com.gestionstock.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "produit")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "mouvements")
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nom;

    @NotBlank
    @Column(unique = true)
    private String reference;

    private int quantite;

    private int seuilMinimum;

    private String categorie;

    @JsonIgnore
    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Mouvement> mouvements;
}
