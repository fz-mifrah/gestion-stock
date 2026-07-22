package com.gestionstock.demo.controller;

import com.gestionstock.demo.dto.LoginRequest;
import com.gestionstock.demo.dto.LoginResponse;
import com.gestionstock.demo.entity.Utilisateur;
import com.gestionstock.demo.repository.UtilisateurRepository;
import com.gestionstock.demo.security.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentification")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @PostMapping("/login")
    @Operation(summary = "Connexion — retourne un token JWT")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getMotDePasse())
        );

        String token = jwtUtils.generateToken(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        Utilisateur utilisateur = utilisateurRepository.findByLogin(userDetails.getUsername())
                .orElseThrow();

        return ResponseEntity.ok(new LoginResponse(token, utilisateur.getLogin(), utilisateur.getRole()));
    }
}
