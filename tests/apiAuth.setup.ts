import { test as setup } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { ApiClient } from "../support/apiClient";
import { env } from "../support/env";

// Igual que auth.setup.ts pero para el token de API: lo pedimos UNA sola vez
// acá y lo compartimos entre todos los workers (ver support/apiClient.ts
// `ApiClient.fromCachedToken`), en vez de que cada worker loguee por su
// cuenta — /auth/login tiene rate-limit y varios logueando a la vez lo
// dispara incluso con reintentos.
const tokenFile = "playwright/.auth/api-token.json";

setup("obtener token de API", async () => {
  const token = await ApiClient.fetchToken(env.proUser.email, env.proUser.password);
  mkdirSync("playwright/.auth", { recursive: true });
  writeFileSync(tokenFile, JSON.stringify({ token }));
});
