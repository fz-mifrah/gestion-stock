package com.gestionstock.demo.service;

import com.gestionstock.demo.dto.ProduitDTO;
import com.gestionstock.demo.entity.Produit;
import com.gestionstock.demo.exception.ProduitNotFoundException;
import com.gestionstock.demo.repository.ProduitRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires du CRUD produit et de la détection des alertes (stock <= seuil).
 */
@ExtendWith(MockitoExtension.class)
class ProduitServiceTest {

    @Mock
    private ProduitRepository produitRepository;

    @InjectMocks
    private ProduitService produitService;

    private ProduitDTO dto() {
        ProduitDTO dto = new ProduitDTO();
        dto.setNom("Souris");
        dto.setReference("REF-SOURIS");
        dto.setQuantite(20);
        dto.setSeuilMinimum(5);
        dto.setCategorie("Périphériques");
        return dto;
    }

    @Test
    @DisplayName("findById retourne le produit quand il existe")
    void findById_existant_retourneProduit() {
        Produit produit = new Produit();
        produit.setId(1L);
        when(produitRepository.findById(1L)).thenReturn(Optional.of(produit));

        assertThat(produitService.findById(1L)).isSameAs(produit);
    }

    @Test
    @DisplayName("findById lève ProduitNotFoundException quand il n'existe pas")
    void findById_inexistant_leveException() {
        when(produitRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> produitService.findById(99L))
                .isInstanceOf(ProduitNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("create mappe le DTO vers l'entité et sauvegarde")
    void create_mappeLeDtoEtSauvegarde() {
        when(produitRepository.save(any(Produit.class))).thenAnswer(inv -> inv.getArgument(0));

        Produit cree = produitService.create(dto());

        assertThat(cree.getNom()).isEqualTo("Souris");
        assertThat(cree.getReference()).isEqualTo("REF-SOURIS");
        assertThat(cree.getQuantite()).isEqualTo(20);
        assertThat(cree.getSeuilMinimum()).isEqualTo(5);
        verify(produitRepository).save(any(Produit.class));
    }

    @Test
    @DisplayName("update met à jour les champs d'un produit existant")
    void update_existant_metAJourLesChamps() {
        Produit existant = new Produit();
        existant.setId(1L);
        existant.setNom("Ancien");
        when(produitRepository.findById(1L)).thenReturn(Optional.of(existant));
        when(produitRepository.save(any(Produit.class))).thenAnswer(inv -> inv.getArgument(0));

        Produit maj = produitService.update(1L, dto());

        assertThat(maj.getNom()).isEqualTo("Souris");
        assertThat(maj.getQuantite()).isEqualTo(20);
    }

    @Test
    @DisplayName("update sur un produit inexistant lève ProduitNotFoundException")
    void update_inexistant_leveException() {
        when(produitRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> produitService.update(99L, dto()))
                .isInstanceOf(ProduitNotFoundException.class);
        verify(produitRepository, never()).save(any());
    }

    @Test
    @DisplayName("delete sur un produit existant appelle deleteById")
    void delete_existant_appelleDeleteById() {
        when(produitRepository.findById(1L)).thenReturn(Optional.of(new Produit()));

        produitService.delete(1L);

        verify(produitRepository).deleteById(1L);
    }

    @Test
    @DisplayName("delete sur un produit inexistant lève l'exception et ne supprime rien")
    void delete_inexistant_leveException() {
        when(produitRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> produitService.delete(99L))
                .isInstanceOf(ProduitNotFoundException.class);
        verify(produitRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("findAlertes délègue à la requête 'produits sous seuil'")
    void findAlertes_delegueAuRepository() {
        Produit critique = new Produit();
        when(produitRepository.findProduitsSousSeuil()).thenReturn(List.of(critique));

        assertThat(produitService.findAlertes()).containsExactly(critique);
    }
}
