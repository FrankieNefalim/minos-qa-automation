import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { TestCasesPage } from "../../pages/TestCasesPage";

test.describe("Casos de Prueba", () => {
  test("crear un caso de prueba nuevo lo muestra en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const testCasesPage = new TestCasesPage(page);
    const title = `Caso automatizado ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await testCasesPage.goto();
    await testCasesPage.createTestCase({
      title,
      step: "Ejecutar el paso creado por la suite de automatización.",
      expectedResult: "El resultado esperado se cumple.",
    });

    await testCasesPage.expectTestCaseVisible(title);
  });
});
