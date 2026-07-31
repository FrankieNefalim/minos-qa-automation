import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { TestPlansPage } from "../../pages/TestPlansPage";

test.describe("Planes de Prueba — edición y borrado", () => {
  test("editar un plan de prueba mantiene su título visible en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const testPlansPage = new TestPlansPage(page);
    const title = `Plan editable ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await testPlansPage.goto();
    await testPlansPage.createTestPlan({ title });
    await testPlansPage.expectTestPlanVisible(title);

    await testPlansPage.editTestPlan(title, { objective: "Objetivo actualizado por la suite de automatización." });
    await testPlansPage.expectTestPlanVisible(title);
  });

  test("borrar un plan de prueba lo quita del listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const testPlansPage = new TestPlansPage(page);
    const title = `Plan borrable ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await testPlansPage.goto();
    await testPlansPage.createTestPlan({ title });
    await testPlansPage.expectTestPlanVisible(title);

    await testPlansPage.deleteTestPlan(title);
    await testPlansPage.expectTestPlanNotVisible(title);
  });
});
