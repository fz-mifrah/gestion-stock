package com.gestionstock.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestionstock.demo.dto.LoginRequest;
import com.gestionstock.demo.entity.Utilisateur;
import com.gestionstock.demo.repository.UtilisateurRepository;
import com.gestionstock.demo.security.JwtUtils;
import com.gestionstock.demo.security.UserDetailsServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration web du AuthController (POST /api/auth/login) via MockMvc.
 * AuthenticationManager, JwtUtils et le repository sont mockés pour ne tester
 * que le contrat HTTP : 200 + token JWT en cas de succès, 400 si requête invalide.
 */
@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationManager authenticationManager;
    @MockBean
    private JwtUtils jwtUtils;
    @MockBean
    private UtilisateurRepository utilisateurRepository;
    // Bean requis par SecurityConfig pour que le contexte se charge.
    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    private LoginRequest request(String login, String motDePasse) {
        LoginRequest req = new LoginRequest();
        req.setLogin(login);
        req.setMotDePasse(motDePasse);
        return req;
    }

    @Test
    @DisplayName("POST /api/auth/login avec identifiants valides retourne 200 + token")
    void login_valide_retourne200EtToken() throws Exception {
        UserDetails userDetails = User.withUsername("admin").password("x").authorities("RESPONSABLE").build();
        Authentication auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(jwtUtils.generateToken(any())).thenReturn("fake-jwt-token");

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setLogin("admin");
        utilisateur.setRole("RESPONSABLE");
        when(utilisateurRepository.findByLogin("admin")).thenReturn(Optional.of(utilisateur));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request("admin", "admin123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt-token"))
                .andExpect(jsonPath("$.login").value("admin"))
                .andExpect(jsonPath("$.role").value("RESPONSABLE"));
    }

    @Test
    @DisplayName("POST /api/auth/login avec mauvais mot de passe propage l'erreur d'authentification")
    void login_mauvaisMotDePasse_echoue() throws Exception {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request("admin", "mauvais"))))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @DisplayName("POST /api/auth/login avec login vide retourne 400 (validation)")
    void login_loginVide_retourne400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request("", ""))))
                .andExpect(status().isBadRequest());
    }
}
