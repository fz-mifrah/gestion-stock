package com.gestionstock.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MouvementDTO {

    @NotBlank(message = "Le type est obligatoire : ENTREE, SORTIE ou TRANSFERT")
    private String type;

    @Min(value = 1, message = "La quantité doit être au moins 1")
    private int quantite;

    private LocalDate date;

    private String motif;

    @NotNull(message = "L'ID du produit est obligatoire")
    private Long produitId;
}
