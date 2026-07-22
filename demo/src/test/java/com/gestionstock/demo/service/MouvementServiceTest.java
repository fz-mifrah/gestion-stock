package com.gestionstock.demo.service;

import com.gestionstock.demo.dto.MouvementDTO;
import com.gestionstock.demo.entity.Mouvement;
import com.gestionstock.demo.entity.Produit;
import com.gestionstock.demo.entity.Utilisateur;
import com.gestionstock.demo.exception.ProduitNotFoundException;
import com.gestionstock.demo.exception.StockInsuffisantException;
import com.gestionstock.demo.repository.MouvementRepository;
import com.gestionstock.demo.repository.ProduitRepository;
import com.gestionstock.demo.repository.UtilisateurRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires de la logique métier des mouvements de stock.
 * Couvre les règles critiques du cahier des charges :
 *  - une SORTIE est impossible si le stock est insuffisant ;
 *  - ENTREE / SORTIE / TRANSFERT mettent à jour la quantité ;
 *  - un type inconnu ou un produit introuvable lèvent une erreur claire.
 */
@ExtendWith(MockitoExtension.class)
class MouvementServiceTest {

    @Mock
    private MouvementRepository mouvementRepository;

    @Mock
    private ProduitRepository produitRepository;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private MouvementService mouvementService;

    @BeforeEach
    void setUpSecurityContext() {
        // Le service lit le login courant via le SecurityContext.
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken("admin", null));
        SecurityContextHolder.setContext(context);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private Produit produit(long id, int quantite) {
        Produit p = new Produit();
        p.setId(id);
        p.setNom("Clavier");
        p.setReference("REF-" + id);
        p.setQuantite(quantite);
        p.setSeuilMinimum(5);
        return p;
    }

    private MouvementDTO dto(String type, int quantite) {
        MouvementDTO dto = new MouvementDTO();
        dto.setType(type);
        dto.setQuantite(quantite);
        dto.setProduitId(1L);
        return dto;
    }

    @Test
    @DisplayName("ENTREE augmente la quantité en stock")
    void enregistrer_entree_augmenteLeStock() {
        Produit produit = produit(1L, 10);
        when(produitRepository.findById(1L)).thenReturn(Optional.of(produit));
        when(utilisateurRepository.findByLogin("admin")).thenReturn(Optional.of(new Utilisateur()));
        when(mouvementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Mouvement resultat = mouvementService.enregistrer(dto("ENTREE", 4));

        assertThat(produit.getQuantite()).isEqualTo(14);
        assertThat(resultat.getType()).isEqualTo("ENTREE");
        verify(produitRepository).save(produit);
    }

    @Test
    @DisplayName("SORTIE avec stock suffisant diminue la quantité")
    void enregistrer_sortie_avecStockSuffisant_diminueLeStock() {
        Produit produit = produit(1L, 10);
        when(produitRepository.findById(1L)).thenReturn(Optional.of(produit));
        when(utilisateurRepository.findByLogin("admin")).thenReturn(Optional.of(new Utilisateur()));
        when(mouvementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mouvementService.enregistrer(dto("SORTIE", 3));

        assertThat(produit.getQuantite()).isEqualTo(7);
        verify(mouvementRepository).save(any(Mouvement.class));
    }

   @Test
    @DisplayName("SORTIE avec stock insuffisant lève StockInsuffisantException et ne touche pas au stock")
    void enregistrer_sortie_avecStockInsuffisant_leveException() {
        Produit produit = produit(1L, 2);
        when(produitRepository.findById(1L)).thenReturn(Optional.of(produit));

        assertThatThrownBy(() -> mouvementService.enregistrer(dto("SORTIE", 5)))
                .isInstanceOf(StockInsuffisantException.class)
                .hasMessageContaining("Stock insuffisant");

        assertThat(produit.getQuantite()).isEqualTo(2); // inchangé
        verify(produitRepository, never()).save(any());
        verify(mouvementRepository, never()).save(any());
    }

    @Test
    @DisplayName("TRANSFERT avec stock suffisant diminue la quantité")
    void enregistrer_transfert_avecStockSuffisant_diminueLeStock() {
        Produit produit = produit(1L, 8);
        when(produitRepository.findById(1L)).thenReturn(Optional.of(produit));
        when(utilisateurRepository.findByLogin("admin")).thenReturn(Optional.of(new Utilisateur()));
        when(mouvementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mouvementService.enregistrer(dto("TRANSFERT", 3));

        assertThat(produit.getQuantite()).isEqualTo(5);
    }

    @Test
    @DisplayName("TRANSFERT avec stock insuffisant lève StockInsuffisantException")
    void enregistrer_transfert_avecStockInsuffisant_leveException() {
        Produit produit = produit(1L, 1);
        when(produitRepository.findById(1L)).thenReturn(Optional.of(produit));

        assertThatThrownBy(() -> mouvementService.enregistrer(dto("TRANSFERT", 5)))
                .isInstanceOf(StockInsuffisantException.class);

        verify(mouvementRepository, never()).save(any());
    }

    @Test
    @DisplayName("Un type inconnu lève IllegalArgumentException")
    void enregistrer_typeInvalide_leveIllegalArgument() {
        Produit produit = produit(1L, 10);
        when(produitRepository.findById(1L)).thenReturn(Optional.of(produit));

        assertThatThrownBy(() -> mouvementService.enregistrer(dto("ACHAT", 1)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Type invalide");
    }

    @Test
    @DisplayName("Un produit introuvable lève ProduitNotFoundException")
    void enregistrer_produitIntrouvable_leveProduitNotFound() {
        when(produitRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> mouvementService.enregistrer(dto("ENTREE", 1)))
                .isInstanceOf(ProduitNotFoundException.class);
    }

    @Test
    @DisplayName("Sans date fournie, la date du jour est utilisée")
    void enregistrer_sansDate_utiliseDateDuJour() {
        Produit produit = produit(1L, 10);
        when(produitRepository.findById(1L)).thenReturn(Optional.of(produit));
        when(utilisateurRepository.findByLogin("admin")).thenReturn(Optional.of(new Utilisateur()));
        when(mouvementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Mouvement resultat = mouvementService.enregistrer(dto("ENTREE", 1));

        assertThat(resultat.getDate()).isEqualTo(LocalDate.now());
    }

    @Test
    @DisplayName("Le type est normalisé en majuscules (entree -> ENTREE)")
    void enregistrer_typeEnMinuscule_estNormalise() {
        Produit produit = produit(1L, 10);
        when(produitRepository.findById(1L)).thenReturn(Optional.of(produit));
        when(utilisateurRepository.findByLogin("admin")).thenReturn(Optional.of(new Utilisateur()));
        when(mouvementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Mouvement resultat = mouvementService.enregistrer(dto("entree", 2));

        assertThat(resultat.getType()).isEqualTo("ENTREE");
        assertThat(produit.getQuantite()).isEqualTo(12);
    }
}
