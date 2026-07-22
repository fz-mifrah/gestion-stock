package com.gestionstock.demo.service;

import com.gestionstock.demo.dto.ProduitDTO;
import com.gestionstock.demo.entity.Produit;
import com.gestionstock.demo.exception.ProduitNotFoundException;
import com.gestionstock.demo.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProduitService {

    @Autowired
    private ProduitRepository produitRepository;

    public List<Produit> findAll() {
        return produitRepository.findAll();
    }

    public Produit findById(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new ProduitNotFoundException("Produit non trouvé avec l'id: " + id));
    }

    public Produit create(ProduitDTO dto) {
        Produit produit = new Produit();
        produit.setNom(dto.getNom());
        produit.setReference(dto.getReference());
        produit.setQuantite(dto.getQuantite());
        produit.setSeuilMinimum(dto.getSeuilMinimum());
        produit.setCategorie(dto.getCategorie());
        return produitRepository.save(produit);
    }

    public Produit update(Long id, ProduitDTO dto) {
        Produit produit = findById(id);
        produit.setNom(dto.getNom());
        produit.setReference(dto.getReference());
        produit.setQuantite(dto.getQuantite());
        produit.setSeuilMinimum(dto.getSeuilMinimum());
        produit.setCategorie(dto.getCategorie());
        return produitRepository.save(produit);
    }

    public void delete(Long id) {
        findById(id);
        produitRepository.deleteById(id);
    }

    public List<Produit> findAlertes() {
        return produitRepository.findProduitsSousSeuil();
    }
}
