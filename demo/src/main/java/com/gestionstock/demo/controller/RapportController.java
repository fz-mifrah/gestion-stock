package com.gestionstock.demo.controller;

import com.gestionstock.demo.entity.Mouvement;
import com.gestionstock.demo.service.MouvementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rapports")
@Tag(name = "Rapports")
@SecurityRequirement(name = "bearerAuth")
public class RapportController {

    @Autowired
    private MouvementService mouvementService;

    @GetMapping
    @Operation(summary = "Mouvements entre deux dates (format: YYYY-MM-DD)")
    public ResponseEntity<List<Mouvement>> getRapport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(mouvementService.findByPeriode(debut, fin));
    }
}
