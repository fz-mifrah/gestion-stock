package com.gestionstock.demo.controller;

import com.gestionstock.demo.dto.MouvementDTO;
import com.gestionstock.demo.entity.Mouvement;
import com.gestionstock.demo.service.MouvementService;
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
@RequestMapping("/api/mouvements")
@Tag(name = "Mouvements")
@SecurityRequirement(name = "bearerAuth")
public class MouvementController {

    @Autowired
    private MouvementService mouvementService;

    @GetMapping
    @Operation(summary = "Liste tous les mouvements")
    public ResponseEntity<List<Mouvement>> getAll() {
        return ResponseEntity.ok(mouvementService.findAll());
    }

    @PostMapping
    @Operation(summary = "Enregistre une entrée, sortie ou transfert de stock")
    public ResponseEntity<Mouvement> enregistrer(@Valid @RequestBody MouvementDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mouvementService.enregistrer(dto));
    }
}
