package com.gestionstock.demo.controller;

import com.gestionstock.demo.dto.AdminDTO;
import com.gestionstock.demo.dto.ChangePasswordDTO;
import com.gestionstock.demo.entity.Utilisateur;
import com.gestionstock.demo.service.AdminService;
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
@RequestMapping("/api/admin")
@Tag(name = "Administration")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/utilisateurs")
    @Operation(summary = "Liste tous les administrateurs")
    public ResponseEntity<List<Utilisateur>> getAll() {
        return ResponseEntity.ok(adminService.findAll());
    }

    @GetMapping("/utilisateurs/{id}")
    @Operation(summary = "Récupère un administrateur par ID")
    public ResponseEntity<Utilisateur> getById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.findById(id));
    }

    @GetMapping("/moi")
    @Operation(summary = "Récupère le profil de l'utilisateur connecté")
    public ResponseEntity<Utilisateur> getMoi() {
        return ResponseEntity.ok(adminService.getConnecte());
    }

    @PostMapping("/utilisateurs")
    @Operation(summary = "Ajoute un nouvel administrateur")
    public ResponseEntity<Utilisateur> create(@Valid @RequestBody AdminDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.create(dto));
    }

    @PutMapping("/utilisateurs/{id}")
    @Operation(summary = "Modifie les informations d'un administrateur")
    public ResponseEntity<Utilisateur> update(@PathVariable Long id, @Valid @RequestBody AdminDTO dto) {
        return ResponseEntity.ok(adminService.update(id, dto));
    }

    @PutMapping("/utilisateurs/{id}/password")
    @Operation(summary = "Change le mot de passe d'un administrateur")
    public ResponseEntity<Void> changePassword(@PathVariable Long id,
                                                @Valid @RequestBody ChangePasswordDTO dto) {
        adminService.changePassword(id, dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/utilisateurs/{id}")
    @Operation(summary = "Supprime un administrateur")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adminService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
