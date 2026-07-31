import { test as setup } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { env } from "../support/env";

// Se ejecuta una sola vez antes de la suite (ver `projects` en playwright.config.ts).
// Loguea por UI y guarda el storageState (cookies/localStorage) para que el
// resto de los tests arranquen ya logueados, sin repetir el login en cada uno.
const authFile = "playwright/.auth/pro-user.json";

setup("autenticar como usuario PRO", async ({ page }) => {
  const loginPage = new LoginPage(page);

  // /auth/login tiene rate-limit (5 intentos/min por IP+email — ver
  // backend/api/auth.py). Si corriste la suite hace poco, puede que este
  // intento choque contra el límite; reintentamos con backoff en vez de
  // fallar de una.
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await loginPage.goto();
      await loginPage.loginAndWaitForRedirect(env.proUser.email, env.proUser.password);
      await page.context().storageState({ path: authFile });
      return;
    } catch (err) {
      lastError = err;
      if (attempt < 3) await page.waitForTimeout(attempt * 15_000); // 15s, 30s
    }
  }
  throw lastError;
});
