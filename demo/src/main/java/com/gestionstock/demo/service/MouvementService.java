package com.gestionstock.demo.service;

import com.gestionstock.demo.dto.MouvementDTO;
import com.gestionstock.demo.entity.Mouvement;
import com.gestionstock.demo.entity.Produit;
import com.gestionstock.demo.exception.ProduitNotFoundException;
import com.gestionstock.demo.exception.StockInsuffisantException;
import com.gestionstock.demo.repository.MouvementRepository;
import com.gestionstock.demo.repository.ProduitRepository;
import com.gestionstock.demo.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MouvementService {

    @Autowired
    private MouvementRepository mouvementRepository;

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public List<Mouvement> findAll() {
        return mouvementRepository.findAll();
    }

    public List<Mouvement> findByPeriode(LocalDate debut, LocalDate fin) {
        return mouvementRepository.findByDateBetween(debut, fin);
    }

    @Transactional
    public Mouvement enregistrer(MouvementDTO dto) {
        Produit produit = produitRepository.findById(dto.getProduitId())
                .orElseThrow(() -> new ProduitNotFoundException("Produit non trouvé: " + dto.getProduitId()));

        String type = dto.getType().toUpperCase();

        switch (type) {
            case "SORTIE" -> {
                if (produit.getQuantite() < dto.getQuantite()) {
                    throw new StockInsuffisantException(
                        "Stock insuffisant. Disponible: " + produit.getQuantite() +
                        ", Demandé: " + dto.getQuantite());
                }
                produit.setQuantite(produit.getQuantite() - dto.getQuantite());
            }
            case "ENTREE" -> produit.setQuantite(produit.getQuantite() + dto.getQuantite());
            case "TRANSFERT" -> {
                if (produit.getQuantite() < dto.getQuantite()) {
                    throw new StockInsuffisantException(
                        "Stock insuffisant pour le transfert. Disponible: " + produit.getQuantite());
                }
                produit.setQuantite(produit.getQuantite() - dto.getQuantite());
            }
            default -> throw new IllegalArgumentException("Type invalide: " + dto.getType() +
                    ". Valeurs acceptées: ENTREE, SORTIE, TRANSFERT");
        }

        produitRepository.save(produit);

        Mouvement mouvement = new Mouvement();
        mouvement.setType(type);
        mouvement.setQuantite(dto.getQuantite());
        mouvement.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        mouvement.setMotif(dto.getMotif());
        mouvement.setProduit(produit);

        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        utilisateurRepository.findByLogin(login).ifPresent(mouvement::setUtilisateur);

        return mouvementRepository.save(mouvement);
    }
}
