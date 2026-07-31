import { expect, test, type Page } from "@playwright/test";

type ResultStatus = "not_run" | "passed" | "failed" | "blocked" | "skipped";

export class TestRunDetailPage {
  constructor(private readonly page: Page) {}

  async startRun() {
    await test.step("Iniciar la ejecución", async () => {
      await this.page.getByTestId("testrun-start-button").click();
      await expect(this.page.getByTestId("testrun-start-button")).toBeHidden();
    });
  }

  /** Trae los casos de la suite como resultados "not_run". Requiere que la
   *  ejecución ya esté iniciada y que la suite tenga al menos un caso
   *  vinculado (ver ApiClient.addTestCaseToSuite). */
  async syncTestCases() {
    await test.step("Sincronizar casos de prueba", async () => {
      await this.page.getByTestId("testrun-sync-button").click();
      await expect(this.page.getByTestId("testrun-result-row").first()).toBeVisible();
    });
  }

  private resultRow(testCaseTitle: string) {
    return this.page.getByTestId("testrun-result-row").filter({ hasText: testCaseTitle });
  }

  /** Marca el resultado de un caso puntual (ubicado por título) dentro de la ejecución. */
  async markResultStatus(testCaseTitle: string, status: ResultStatus) {
    await test.step(`Marcar "${testCaseTitle}" como "${status}"`, async () => {
      await this.resultRow(testCaseTitle).getByTestId("testrun-result-status-select").selectOption(status);
    });
  }

  async finishRun() {
    await test.step("Finalizar la ejecución", async () => {
      await this.page.getByTestId("testrun-finish-button").click();
      await expect(this.page.getByTestId("testrun-finished-banner")).toBeVisible();
    });
  }

  async expectResultStatusDisabled(testCaseTitle: string) {
    await test.step(`Verificar que el resultado de "${testCaseTitle}" ya no se puede editar`, async () => {
      await expect(this.resultRow(testCaseTitle).getByTestId("testrun-result-status-select")).toBeDisabled();
    });
  }

  async expectResultStatus(testCaseTitle: string, status: ResultStatus) {
    await test.step(`Verificar que "${testCaseTitle}" quedó en "${status}"`, async () => {
      await expect(this.resultRow(testCaseTitle).getByTestId("testrun-result-status-select")).toHaveValue(status);
    });
  }
}
