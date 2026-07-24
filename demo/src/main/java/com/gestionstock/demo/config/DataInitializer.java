package com.gestionstock.demo.config;

import com.gestionstock.demo.entity.Utilisateur;
import com.gestionstock.demo.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.default-admin.enabled:false}")
    private boolean defaultAdminEnabled;

    @Value("${app.default-admin.login:admin}")
    private String defaultAdminLogin;

    @Value("${app.default-admin.password:}")
    private String defaultAdminPassword;

    @Value("${app.default-admin.role:RESPONSABLE}")
    private String defaultAdminRole;

    @Override
    public void run(String... args) {
        if (!defaultAdminEnabled || defaultAdminPassword.isBlank()) {
            return;
        }

        if (utilisateurRepository.findByLogin(defaultAdminLogin).isEmpty()) {
            Utilisateur admin = new Utilisateur();
            admin.setLogin(defaultAdminLogin);
            admin.setMotDePasse(passwordEncoder.encode(defaultAdminPassword));
            admin.setRole(defaultAdminRole);
            utilisateurRepository.save(admin);
            System.out.println(">>> Utilisateur administrateur initial créé : login=" + defaultAdminLogin);
        }
    }
}
