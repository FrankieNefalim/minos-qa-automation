import { expect, test, type Page } from "@playwright/test";

export class TestCasesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await test.step("Ir a /testcases", async () => {
      await this.page.goto("/testcases");
    });
  }

  /** Crea un caso de prueba con el mínimo indispensable: título + un paso.
   *  El resto de los campos (requerimiento, módulo, tipo, severidad, tags,
   *  ambientes, etc.) es opcional en el form. */
  async createTestCase(data: { title: string; step: string; expectedResult?: string }) {
    await test.step(`Crear caso de prueba "${data.title}"`, async () => {
      await this.page.getByTestId("testcase-new-button").click();
      await this.page.waitForURL("**/testcases/new");

      await this.page.getByTestId("testcase-title-input").fill(data.title);
      await this.page.getByTestId("testcase-step-0-input").fill(data.step);
      if (data.expectedResult) {
        await this.page.getByTestId("testcase-expected-result-textarea").fill(data.expectedResult);
      }

      await this.page.getByTestId("testcase-submit-button").click();
      // Al crear, el form navega de vuelta al listado.
      await this.page.waitForURL("**/testcases");
    });
  }

  async expectTestCaseVisible(title: string) {
    await test.step(`Verificar que "${title}" aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
    });
  }
}
