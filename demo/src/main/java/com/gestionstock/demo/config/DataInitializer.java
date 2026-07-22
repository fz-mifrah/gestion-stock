package com.gestionstock.demo.config;

import com.gestionstock.demo.entity.Utilisateur;
import com.gestionstock.demo.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (utilisateurRepository.findByLogin("admin").isEmpty()) {
            Utilisateur admin = new Utilisateur();
            admin.setLogin("admin");
            admin.setMotDePasse(passwordEncoder.encode("admin123"));
            admin.setRole("RESPONSABLE");
            utilisateurRepository.save(admin);
            System.out.println(">>> Utilisateur créé : login=admin  mot de passe=admin123");
        }
    }
}
