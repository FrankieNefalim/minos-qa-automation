import { test as base } from "@playwright/test";
import { ApiClient } from "../support/apiClient";
import { env } from "../support/env";

export type TestProject = {
  id: number;
  name: string;
  code: string;
  featureId: number;
};

type Fixtures = {
  testProject: TestProject;
};

/**
 * Extiende el `test` base de Playwright con un fixture `testProject`:
 * antes del test, crea un proyecto + una feature por API (rápido, no depende
 * de datos cargados a mano); después del test, borra el proyecto para no
 * ensuciar la cuenta de demo.
 *
 * Uso:
 *   import { test } from "../../fixtures/testProject.fixture";
 *   test("crea un requerimiento", async ({ page, testProject }) => { ... });
 */
export const test = base.extend<Fixtures>({
  testProject: async ({}, use) => {
    const api = await ApiClient.loginAs(env.proUser.email, env.proUser.password);

    const unique = Date.now();
    const project = await api.createProject(`QA Automation ${unique}`);
    const feature = await api.createFeature(project.id, `Feature de test ${unique}`);

    await use({ id: project.id, name: project.name, code: project.code, featureId: feature.id });

    await api.deleteProject(project.id).catch(() => {
      // Si falla el cleanup no tiene sentido fallar el test por eso —
      // solo queda un proyecto de más en la cuenta de demo.
    });
    await api.dispose();
  },
});

export { expect } from "@playwright/test";
