import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { TestSuitesPage } from "../../pages/TestSuitesPage";

test.describe("Suites de Prueba — edición y borrado", () => {
  test("editar el nombre de una suite lo refleja en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const testSuitesPage = new TestSuitesPage(page);
    const name = `Suite editable ${Date.now()}`;
    const newName = `${name} (editada)`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await testSuitesPage.goto();
    await testSuitesPage.createSuite({ name, description: "Suite creada para probar edición." });
    await testSuitesPage.expectSuiteVisible(name);

    await testSuitesPage.editSuite(name, newName);
    await testSuitesPage.expectSuiteVisible(newName);
  });

  test("borrar una suite la quita del listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const testSuitesPage = new TestSuitesPage(page);
    const name = `Suite borrable ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await testSuitesPage.goto();
    await testSuitesPage.createSuite({ name, description: "Suite creada para probar borrado." });
    await testSuitesPage.expectSuiteVisible(name);

    await testSuitesPage.deleteSuite(name);
    await testSuitesPage.expectSuiteNotVisible(name);
  });
});
