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

  /** Ubica la fila por título, edita el título en /testcases/:id/edit y guarda. */
  async editTestCase(title: string, newTitle: string) {
    await test.step(`Editar caso de prueba "${title}" → "${newTitle}"`, async () => {
      await this.page.getByRole("row", { name: title }).getByTestId("testcase-edit-button").click();
      await this.page.waitForURL("**/testcases/*/edit");
      await this.page.getByTestId("testcase-title-input").fill(newTitle);
      await this.page.getByTestId("testcase-submit-button").click();
      await this.page.waitForURL("**/testcases");
    });
  }

  /** Ubica la fila por título, clickea "Eliminar" y confirma el modal. */
  async deleteTestCase(title: string) {
    await test.step(`Borrar caso de prueba "${title}"`, async () => {
      await this.page.getByRole("row", { name: title }).getByTestId("testcase-delete-button").click();
      await this.page.getByTestId("confirm-accept-button").click();
    });
  }

  async expectTestCaseVisible(title: string) {
    await test.step(`Verificar que "${title}" aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
    });
  }

  async expectTestCaseNotVisible(title: string) {
    await test.step(`Verificar que "${title}" ya no aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true })).toHaveCount(0);
    });
  }
}
