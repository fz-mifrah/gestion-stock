package com.gestionstock.demo.controller;

import com.gestionstock.demo.entity.Produit;
import com.gestionstock.demo.service.ProduitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alertes")
@Tag(name = "Alertes")
@SecurityRequirement(name = "bearerAuth")
public class AlerteController {

    @Autowired
    private ProduitService produitService;

    @GetMapping
    @Operation(summary = "Produits dont le stock est inférieur ou égal au seuil minimum")
    public ResponseEntity<List<Produit>> getAlertes() {
        return ResponseEntity.ok(produitService.findAlertes());
    }
}
