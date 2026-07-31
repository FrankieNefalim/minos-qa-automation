import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { TestPlansPage } from "../../pages/TestPlansPage";

test.describe("Planes de Prueba", () => {
  test("crear un plan de prueba nuevo lo muestra en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const testPlansPage = new TestPlansPage(page);
    const title = `Plan automatizado ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await testPlansPage.goto();
    await testPlansPage.createTestPlan({
      title,
      objective: "Creado por la suite de automatización de MINOS.",
    });

    await testPlansPage.expectTestPlanVisible(title);
  });
});
