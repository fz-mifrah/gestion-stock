package com.gestionstock.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProduitDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "La référence est obligatoire")
    private String reference;

    @Min(value = 0, message = "La quantité ne peut pas être négative")
    private int quantite;

    @Min(value = 0, message = "Le seuil minimum ne peut pas être négatif")
    private int seuilMinimum;

    private String categorie;
}
