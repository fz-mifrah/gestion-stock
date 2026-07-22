package com.gestionstock.demo.service;

import com.gestionstock.demo.dto.DashboardStatsDTO;
import com.gestionstock.demo.entity.Mouvement;
import com.gestionstock.demo.repository.MouvementRepository;
import com.gestionstock.demo.repository.ProduitRepository;
import com.gestionstock.demo.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private ProduitRepository produitRepository;
    @Autowired private MouvementRepository mouvementRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;

    public DashboardStatsDTO getStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalProduits(produitRepository.count());
        stats.setTotalMouvements(mouvementRepository.count());
        stats.setTotalAlertes(produitRepository.findProduitsSousSeuil().size());
        stats.setTotalAdmins(utilisateurRepository.count());
        stats.setTotalEntrees(mouvementRepository.countByType("ENTREE"));
        stats.setTotalSorties(mouvementRepository.countByType("SORTIE"));
        stats.setTotalTransferts(mouvementRepository.countByType("TRANSFERT"));

        stats.setMouvementsParJour(getMouvementsLast30Days());
        stats.setTopProduits(getTopProduits());
        stats.setMouvementsParType(getMouvementsParType(stats));

        return stats;
    }

    private List<Map<String, Object>> getMouvementsLast30Days() {
        LocalDate startDate = LocalDate.now().minusDays(29);
        List<Mouvement> mouvements = mouvementRepository.findByDateAfter(startDate.minusDays(1));
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");

        Map<LocalDate, Long> parJour = new TreeMap<>();
        for (int i = 0; i < 30; i++) {
            parJour.put(startDate.plusDays(i), 0L);
        }
        mouvements.stream()
                .filter(m -> m.getDate() != null)
                .forEach(m -> parJour.merge(m.getDate(), 1L, Long::sum));

        List<Map<String, Object>> result = new ArrayList<>();
        parJour.forEach((date, count) -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", date.format(fmt));
            entry.put("mouvements", count);
            result.add(entry);
        });
        return result;
    }

    private List<Map<String, Object>> getTopProduits() {
        return mouvementRepository.findAll().stream()
                .filter(m -> m.getProduit() != null)
                .collect(Collectors.groupingBy(m -> m.getProduit().getNom(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("nom", e.getKey());
                    map.put("mouvements", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getMouvementsParType(DashboardStatsDTO stats) {
        List<Map<String, Object>> result = new ArrayList<>();
        result.add(Map.of("type", "Entrées", "count", stats.getTotalEntrees()));
        result.add(Map.of("type", "Sorties", "count", stats.getTotalSorties()));
        result.add(Map.of("type", "Transferts", "count", stats.getTotalTransferts()));
        return result;
    }
}
