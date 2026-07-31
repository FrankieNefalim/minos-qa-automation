import { test as base } from "@playwright/test";
import { readFileSync } from "node:fs";
import { ApiClient } from "../support/apiClient";

const tokenFile = "playwright/.auth/api-token.json";

export type TestProject = {
  id: number;
  name: string;
  code: string;
  featureId: number;
  suiteId: number;
};

type Fixtures = {
  testProject: TestProject;
};

type WorkerFixtures = {
  apiClient: ApiClient;
};

/**
 * Extiende el `test` base de Playwright con:
 *  - `apiClient` (worker-scoped): reutiliza el token que `tests/apiAuth.setup.ts`
 *    obtuvo UNA sola vez para toda la corrida (no loguea de nuevo por
 *    worker) — /auth/login tiene rate-limit y varios workers logueando casi
 *    al mismo tiempo lo disparan incluso con reintentos.
 *  - `testProject` (test-scoped): crea un proyecto + feature + test suite
 *    por API antes de cada test (rápido, no depende de datos cargados a
 *    mano) y borra el proyecto al terminar.
 *
 * Uso:
 *   import { test } from "../../fixtures/testProject.fixture";
 *   test("crea un requerimiento", async ({ page, testProject }) => { ... });
 */
export const test = base.extend<Fixtures, WorkerFixtures>({
  apiClient: [
    async ({}, use) => {
      const { token } = JSON.parse(readFileSync(tokenFile, "utf-8"));
      const api = await ApiClient.fromToken(token);
      await use(api);
      await api.dispose();
    },
    { scope: "worker" },
  ],

  testProject: async ({ apiClient }, use) => {
    const unique = Date.now();
    const project = await apiClient.createProject(`QA Automation ${unique}`);
    const feature = await apiClient.createFeature(project.id, `Feature de test ${unique}`);
    const suite = await apiClient.createTestSuite(project.id, `Suite de test ${unique}`);

    await use({
      id: project.id,
      name: project.name,
      code: project.code,
      featureId: feature.id,
      suiteId: suite.id,
    });

    await apiClient.deleteProject(project.id).catch(() => {
      // Si falla el cleanup no tiene sentido fallar el test por eso —
      // solo queda un proyecto de más en la cuenta de demo.
    });
  },
});

export { expect } from "@playwright/test";
