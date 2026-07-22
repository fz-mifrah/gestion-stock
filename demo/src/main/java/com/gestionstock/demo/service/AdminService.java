package com.gestionstock.demo.service;

import com.gestionstock.demo.dto.AdminDTO;
import com.gestionstock.demo.dto.ChangePasswordDTO;
import com.gestionstock.demo.entity.Utilisateur;
import com.gestionstock.demo.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Utilisateur> findAll() {
        return utilisateurRepository.findAll();
    }

    public Utilisateur findById(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé: " + id));
    }

    public Utilisateur create(AdminDTO dto) {
        if (utilisateurRepository.findByLogin(dto.getLogin()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce login est déjà utilisé");
        }
        if (dto.getMotDePasse() == null || dto.getMotDePasse().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mot de passe est obligatoire pour un nouvel admin");
        }
        Utilisateur u = new Utilisateur();
        u.setLogin(dto.getLogin());
        u.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        u.setNom(dto.getNom());
        u.setPrenom(dto.getPrenom());
        u.setEmail(dto.getEmail());
        u.setTelephone(dto.getTelephone());
        u.setRole(dto.getRole() != null ? dto.getRole() : "RESPONSABLE");
        return utilisateurRepository.save(u);
    }

    public Utilisateur update(Long id, AdminDTO dto) {
        Utilisateur u = findById(id);
        if (!u.getLogin().equals(dto.getLogin())) {
            utilisateurRepository.findByLogin(dto.getLogin()).ifPresent(existing -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce login est déjà utilisé");
            });
        }
        u.setLogin(dto.getLogin());
        u.setNom(dto.getNom());
        u.setPrenom(dto.getPrenom());
        u.setEmail(dto.getEmail());
        u.setTelephone(dto.getTelephone());
        if (dto.getRole() != null) u.setRole(dto.getRole());
        return utilisateurRepository.save(u);
    }

    public void changePassword(Long id, ChangePasswordDTO dto) {
        Utilisateur u = findById(id);
        if (!passwordEncoder.matches(dto.getAncienMotDePasse(), u.getMotDePasse())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ancien mot de passe incorrect");
        }
        u.setMotDePasse(passwordEncoder.encode(dto.getNouveauMotDePasse()));
        utilisateurRepository.save(u);
    }

    public void delete(Long id) {
        String loginConnecte = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur u = findById(id);
        if (u.getLogin().equals(loginConnecte)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vous ne pouvez pas supprimer votre propre compte");
        }
        utilisateurRepository.deleteById(id);
    }

    public Utilisateur getConnecte() {
        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
    }
}
