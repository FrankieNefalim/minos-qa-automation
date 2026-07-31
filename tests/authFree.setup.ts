import { test as setup } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { env } from "../support/env";

// Mismo patrón que auth.setup.ts, pero para el usuario free@qapal.local —
// se usa como "miembro invitado" en los tests de permisos por rol, que
// necesitan loguear con una identidad distinta a la del owner PRO.
const authFile = "playwright/.auth/free-user.json";

setup("autenticar como usuario FREE", async ({ page }) => {
  const loginPage = new LoginPage(page);

  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await loginPage.goto();
      await loginPage.loginAndWaitForRedirect(env.freeUser.email, env.freeUser.password);
      await page.context().storageState({ path: authFile });
      return;
    } catch (err) {
      lastError = err;
      if (attempt < 3) await page.waitForTimeout(attempt * 15_000);
    }
  }
  throw lastError;
});
