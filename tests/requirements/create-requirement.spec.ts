import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { RequirementsPage } from "../../pages/RequirementsPage";

// Corre en el proyecto "chromium" (ya logueado vía storageState de auth.setup.ts).
test.describe("Requerimientos", () => {
  test("crear un requerimiento nuevo lo muestra en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const requirementsPage = new RequirementsPage(page);
    const title = `Requerimiento automatizado ${Date.now()}`;

    // Elegimos el proyecto ANTES de ir a /requirements: cambiar de proyecto
    // activo redirige a /dashboard, así que hacerlo ahí evita una carrera
    // contra esa navegación.
    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await requirementsPage.goto();
    await requirementsPage.clickNewRequirement();
    await requirementsPage.createRequirement({
      title,
      featureId: testProject.featureId,
      description: "Creado por la suite de automatización de MINOS.",
      acceptanceCriteria: "El requerimiento debe quedar visible en el listado del proyecto.",
    });

    await requirementsPage.expectRequirementVisible(title);
  });
});
