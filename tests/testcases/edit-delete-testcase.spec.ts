import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { TestCasesPage } from "../../pages/TestCasesPage";

test.describe("Casos de Prueba — edición y borrado", () => {
  test("editar el título de un caso de prueba lo refleja en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const testCasesPage = new TestCasesPage(page);
    const title = `Caso editable ${Date.now()}`;
    const newTitle = `${title} (editado)`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await testCasesPage.goto();
    await testCasesPage.createTestCase({
      title,
      step: "Paso creado para probar edición.",
    });
    await testCasesPage.expectTestCaseVisible(title);

    await testCasesPage.editTestCase(title, newTitle);
    await testCasesPage.expectTestCaseVisible(newTitle);
  });

  test("borrar un caso de prueba lo quita del listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const testCasesPage = new TestCasesPage(page);
    const title = `Caso borrable ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await testCasesPage.goto();
    await testCasesPage.createTestCase({
      title,
      step: "Paso creado para probar borrado.",
    });
    await testCasesPage.expectTestCaseVisible(title);

    await testCasesPage.deleteTestCase(title);
    await testCasesPage.expectTestCaseNotVisible(title);
  });
});
