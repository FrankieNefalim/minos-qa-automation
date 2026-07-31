import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { env } from "../../support/env";

// Corre en el proyecto "chromium-no-auth" (sin storageState): estos tests
// necesitan arrancar deslogueados para probar el login en sí.
test.describe("Login", () => {
  test("credenciales válidas redirige fuera de /login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.loginAndWaitForRedirect(env.proUser.email, env.proUser.password);

    await expect(page).not.toHaveURL(/\/login/);
  });

  test("credenciales inválidas muestra error y no navega", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(env.proUser.email, "contraseña-incorrecta");

    await loginPage.expectError();
    await expect(page).toHaveURL(/\/login/);
  });
});
