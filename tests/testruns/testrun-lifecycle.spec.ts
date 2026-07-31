import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { TestRunsPage } from "../../pages/TestRunsPage";
import { TestRunDetailPage } from "../../pages/TestRunDetailPage";

test.describe("Ejecuciones — ciclo de vida", () => {
  test("iniciar, sincronizar, marcar un resultado y finalizar una ejecución", async ({
    page,
    testProject,
    apiClient,
  }) => {
    const appShell = new AppShell(page);
    const testRunsPage = new TestRunsPage(page);
    const testRunDetailPage = new TestRunDetailPage(page);

    const caseTitle = `Caso para ejecución ${Date.now()}`;
    const runName = `Ejecución de ciclo de vida ${Date.now()}`;

    const testCase = await apiClient.createTestCase(testProject.id, caseTitle, "Paso único de prueba.");
    await apiClient.addTestCaseToSuite(testProject.suiteId, testCase.id);

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await testRunsPage.goto();
    await testRunsPage.createRun({ name: runName, suiteId: testProject.suiteId });
    await testRunsPage.openRun(runName);

    await testRunDetailPage.startRun();
    await testRunDetailPage.syncTestCases();
    await testRunDetailPage.markResultStatus(caseTitle, "passed");
    await testRunDetailPage.finishRun();

    await testRunDetailPage.expectResultStatus(caseTitle, "passed");
    await testRunDetailPage.expectResultStatusDisabled(caseTitle);
  });
});
