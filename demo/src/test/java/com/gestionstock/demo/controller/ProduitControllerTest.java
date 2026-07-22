package com.gestionstock.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestionstock.demo.dto.ProduitDTO;
import com.gestionstock.demo.entity.Produit;
import com.gestionstock.demo.exception.ProduitNotFoundException;
import com.gestionstock.demo.security.JwtUtils;
import com.gestionstock.demo.security.UserDetailsServiceImpl;
import com.gestionstock.demo.service.ProduitService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration web (couche REST) du ProduitController via MockMvc.
 * La chaîne de filtres de sécurité est désactivée (addFilters = false) pour
 * tester le contrôleur isolément ; les beans de sécurité sont mockés afin
 * que le contexte se charge. La sérialisation JSON, la validation et le
 * GlobalExceptionHandler sont bien exercés.
 */
@WebMvcTest(ProduitController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProduitControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProduitService produitService;

    // Beans requis par SecurityConfig pour que le contexte se charge.
    @MockBean
    private JwtUtils jwtUtils;
    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    private Produit produit(long id, String nom) {
        Produit p = new Produit();
        p.setId(id);
        p.setNom(nom);
        p.setReference("REF-" + id);
        p.setQuantite(10);
        p.setSeuilMinimum(5);
        p.setCategorie("Périphériques");
        return p;
    }

    private ProduitDTO dtoValide() {
        ProduitDTO dto = new ProduitDTO();
        dto.setNom("Souris");
        dto.setReference("REF-SOURIS");
        dto.setQuantite(20);
        dto.setSeuilMinimum(5);
        dto.setCategorie("Périphériques");
        return dto;
    }

    @Test
    @DisplayName("GET /api/produits retourne 200 et la liste JSON")
    void getAll_retourne200EtListe() throws Exception {
        when(produitService.findAll()).thenReturn(List.of(produit(1L, "Clavier"), produit(2L, "Écran")));

        mockMvc.perform(get("/api/produits"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].nom").value("Clavier"))
                .andExpect(jsonPath("$[1].nom").value("Écran"));
    }

    @Test
    @DisplayName("GET /api/produits/{id} retourne 200 quand le produit existe")
    void getById_existant_retourne200() throws Exception {
        when(produitService.findById(1L)).thenReturn(produit(1L, "Clavier"));

        mockMvc.perform(get("/api/produits/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Clavier"))
                .andExpect(jsonPath("$.reference").value("REF-1"));
    }

    @Test
    @DisplayName("GET /api/produits/{id} retourne 404 quand le produit est introuvable")
    void getById_inexistant_retourne404() throws Exception {
        when(produitService.findById(99L))
                .thenThrow(new ProduitNotFoundException("Produit non trouvé avec l'id: 99"));

        mockMvc.perform(get("/api/produits/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erreur").value("Produit non trouvé avec l'id: 99"));
    }

    @Test
    @DisplayName("POST /api/produits avec données valides retourne 201")
    void create_valide_retourne201() throws Exception {
        when(produitService.create(any(ProduitDTO.class))).thenReturn(produit(5L, "Souris"));

        mockMvc.perform(post("/api/produits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoValide())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    @DisplayName("POST /api/produits avec nom vide retourne 400 (validation)")
    void create_invalide_retourne400() throws Exception {
        ProduitDTO invalide = dtoValide();
        invalide.setNom("");          // viole @NotBlank
        invalide.setReference("");    // viole @NotBlank

        mockMvc.perform(post("/api/produits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalide)))
                .andExpect(status().isBadRequest());

        verify(produitService, never()).create(any());
    }

    @Test
    @DisplayName("PUT /api/produits/{id} retourne 200 et le produit mis à jour")
    void update_retourne200() throws Exception {
        when(produitService.update(eq(1L), any(ProduitDTO.class))).thenReturn(produit(1L, "Souris"));

        mockMvc.perform(put("/api/produits/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoValide())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Souris"));
    }

    @Test
    @DisplayName("DELETE /api/produits/{id} retourne 204")
    void delete_retourne204() throws Exception {
        doNothing().when(produitService).delete(1L);

        mockMvc.perform(delete("/api/produits/1"))
                .andExpect(status().isNoContent());

        verify(produitService).delete(1L);
    }
}
