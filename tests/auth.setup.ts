import { test as setup } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { env } from "../support/env";

// Se ejecuta una sola vez antes de la suite (ver `projects` en playwright.config.ts).
// Loguea por UI y guarda el storageState (cookies/localStorage) para que el
// resto de los tests arranquen ya logueados, sin repetir el login en cada uno.
const authFile = "playwright/.auth/pro-user.json";

setup("autenticar como usuario PRO", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAndWaitForRedirect(env.proUser.email, env.proUser.password);

  await page.context().storageState({ path: authFile });
});
