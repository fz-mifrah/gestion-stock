package com.gestionstock.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminDTO {

    @NotBlank(message = "Le login est obligatoire")
    private String login;

    private String motDePasse;

    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String role = "RESPONSABLE";
}
