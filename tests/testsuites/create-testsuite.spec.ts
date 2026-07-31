import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { TestSuitesPage } from "../../pages/TestSuitesPage";

test.describe("Suites de Prueba", () => {
  test("crear una suite nueva la muestra en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const testSuitesPage = new TestSuitesPage(page);
    const name = `Suite automatizada ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await testSuitesPage.goto();
    await testSuitesPage.createSuite({
      name,
      description: "Creada por la suite de automatización de MINOS.",
    });

    await testSuitesPage.expectSuiteVisible(name);
  });
});
