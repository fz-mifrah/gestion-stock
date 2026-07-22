package com.gestionstock.demo.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class DashboardStatsDTO {

    private long totalProduits;
    private long totalMouvements;
    private long totalAlertes;
    private long totalAdmins;
    private long totalEntrees;
    private long totalSorties;
    private long totalTransferts;

    private List<Map<String, Object>> mouvementsParJour;
    private List<Map<String, Object>> topProduits;
    private List<Map<String, Object>> mouvementsParType;
}
