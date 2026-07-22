import { test, expect } from '@playwright/test';

/**
 * Parcours d'authentification, joué dans un vrai navigateur.
 * Les réponses du backend sont SIMULÉES (route mocking) : ces tests E2E
 * tournent donc sans MySQL ni Spring Boot, ce qui les rend fiables en démo.
 *
 * Pour tester contre le VRAI backend : démarrer MySQL + Spring Boot, puis
 * retirer les appels à mockApi() ci-dessous (le formulaire appellera la vraie API).
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

// Intercepte une URL d'API et renvoie une réponse JSON simulée.
async function mockApi(page, urlGlob, status, data) {
  await page.route(urlGlob, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: corsHeaders });
    }
    return route.fulfill({
      status,
      headers: corsHeaders,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

const dashboardStats = {
  totalProduits: 12,
  totalMouvements: 30,
  totalAlertes: 2,
  totalAdmins: 1,
  totalEntrees: 18,
  totalSorties: 10,
  totalTransferts: 2,
  mouvementsParJour: [{ date: '2026-06-15', mouvements: 3 }],
  mouvementsParType: [
    { type: 'ENTREE', count: 18 },
    { type: 'SORTIE', count: 10 },
    { type: 'TRANSFERT', count: 2 },
  ],
  topProduits: [{ nom: 'Clavier', mouvements: 5 }],
};

async function seConnecter(page) {
  await page.goto('/login');
  await page.getByPlaceholder('admin').fill('admin');
  await page.getByPlaceholder('••••••••').fill('admin123');
  await page.getByRole('button', { name: 'Se connecter' }).click();
}

test('Connexion réussie : redirige vers le tableau de bord', async ({ page }) => {
  await mockApi(page, '**/api/auth/login', 200, {
    token: 'fake-jwt-token', login: 'admin', role: 'RESPONSABLE',
  });
  await mockApi(page, '**/api/dashboard', 200, dashboardStats);

  await seConnecter(page);

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();
  // La première carte de statistiques (total produits) affiche bien la valeur mockée
  await expect(page.locator('.stat-value').first()).toHaveText('12');
});

test('Connexion échouée : affiche un message d\'erreur et reste sur /login', async ({ page }) => {
  await mockApi(page, '**/api/auth/login', 401, { erreur: 'Identifiants invalides' });

  await seConnecter(page);

  await expect(page.getByText('Login ou mot de passe incorrect')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('Déconnexion : ramène à la page d\'accueil', async ({ page }) => {
  await mockApi(page, '**/api/auth/login', 200, {
    token: 'fake-jwt-token', login: 'admin', role: 'RESPONSABLE',
  });
  await mockApi(page, '**/api/dashboard', 200, dashboardStats);

  await seConnecter(page);
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole('button', { name: 'Déconnexion' }).click();

  await expect(page).toHaveURL(/localhost:5173\/$/);
  await expect(page.getByRole('heading', { name: 'StockIQ' })).toBeVisible();
});
