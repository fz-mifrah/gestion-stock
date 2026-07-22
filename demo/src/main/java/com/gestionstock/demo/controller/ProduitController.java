package com.gestionstock.demo.controller;

import com.gestionstock.demo.dto.ProduitDTO;
import com.gestionstock.demo.entity.Produit;
import com.gestionstock.demo.service.ProduitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
@Tag(name = "Produits")
@SecurityRequirement(name = "bearerAuth")
public class ProduitController {

    @Autowired
    private ProduitService produitService;

    @GetMapping
    @Operation(summary = "Liste tous les produits")
    public ResponseEntity<List<Produit>> getAll() {
        return ResponseEntity.ok(produitService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupère un produit par ID")
    public ResponseEntity<Produit> getById(@PathVariable Long id) {
        return ResponseEntity.ok(produitService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Ajoute un nouveau produit")
    public ResponseEntity<Produit> create(@Valid @RequestBody ProduitDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produitService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifie un produit existant")
    public ResponseEntity<Produit> update(@PathVariable Long id, @Valid @RequestBody ProduitDTO dto) {
        return ResponseEntity.ok(produitService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime un produit")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        produitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
