import { test, expect } from '@playwright/test';

/**
 * Parcours public (aucun backend nécessaire) :
 * la page d'accueil et la navigation vers/depuis la page de connexion.
 */
test.describe('Navigation publique', () => {

  test("La page d'accueil affiche StockIQ et mène à la connexion", async ({ page }) => {
    await page.goto('/');

    // L'utilisateur voit la landing page
    await expect(page.getByRole('heading', { name: 'StockIQ' })).toBeVisible();

    // Il clique sur le bouton d'appel à l'action
    await page.getByRole('link', { name: /Commencer maintenant/ }).click();

    // Il arrive sur la page de connexion
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  });

  test("Le lien « Retour à l'accueil » ramène à la page d'accueil", async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: /Retour à l'accueil/ }).click();

    await expect(page).toHaveURL(/localhost:5173\/$/);
    await expect(page.getByRole('heading', { name: 'StockIQ' })).toBeVisible();
  });

});
