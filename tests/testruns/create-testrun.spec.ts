import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { TestRunsPage } from "../../pages/TestRunsPage";

test.describe("Ejecuciones", () => {
  test("crear una ejecución a partir de una suite existente la muestra en el listado", async ({
    page,
    testProject,
  }) => {
    const appShell = new AppShell(page);
    const testRunsPage = new TestRunsPage(page);
    const name = `Ejecución automatizada ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await testRunsPage.goto();
    await testRunsPage.createRun({
      name,
      suiteId: testProject.suiteId,
      result: "passed",
    });

    await testRunsPage.expectRunVisible(name);
  });
});
