import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const authFile = "playwright/.auth/pro-user.json";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Todos los tests pegan contra la misma cuenta de demo compartida
  // (pro@qapal.local) — con varios workers en paralelo puede haber
  // contención puntual (ej. generación de key por proyecto) que hace fallar
  // un test de forma transitoria. Un reintento alcanza para esos casos; si
  // falla dos veces seguidas es un bug real, no ruido de concurrencia.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    ["allure-playwright", { resultsDir: "./allure-results", detail: true, suiteTitle: false }],
  ],

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:5173",
    // MINOS por default renderiza en español (i18next cae a "es" cuando no
    // hay preferencia guardada). Si no fijamos el locale del browser acá,
    // Playwright usa el locale del SO/CI (a menudo en-US) y el detector de
    // idioma del front arranca la app en inglés, rompiendo selectores de
    // texto y volviendo los tests dependientes de la máquina que los corre.
    locale: "es-AR",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // Corre auth.setup.ts primero y guarda el storageState logueado.
    { name: "setup", testMatch: /.*\.setup\.ts/ },

    // Tests que necesitan sesión ya iniciada (la mayoría del producto).
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: authFile },
      dependencies: ["setup"],
      testIgnore: /auth\/login\.spec\.ts/,
    },

    // El propio flujo de login se prueba sin sesión previa.
    {
      name: "chromium-no-auth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /auth\/login\.spec\.ts/,
    },

    // Descomentar para correr cross-browser:
    // { name: "firefox", use: { ...devices["Desktop Firefox"], storageState: authFile }, dependencies: ["setup"] },
    // { name: "webkit", use: { ...devices["Desktop Safari"], storageState: authFile }, dependencies: ["setup"] },
  ],
});
