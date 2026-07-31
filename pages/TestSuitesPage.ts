import { expect, test, type Page } from "@playwright/test";

export class TestSuitesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await test.step("Ir a /testsuites", async () => {
      await this.page.goto("/testsuites");
    });
  }

  async createSuite(data: { name: string; description: string }) {
    await test.step(`Crear suite de prueba "${data.name}"`, async () => {
      await this.page.getByTestId("testsuite-new-button").click();
      await this.page.getByTestId("testsuite-name-input").fill(data.name);
      // La descripción es obligatoria en el form (validación de cliente),
      // aunque el backend la acepte vacía.
      await this.page.getByTestId("testsuite-description-textarea").fill(data.description);
      await this.page.getByTestId("testsuite-save-button").click();
      await expect(this.page.getByTestId("testsuite-save-button")).toBeHidden();
    });
  }

  /** Ubica la fila por nombre, abre el modal de edición (mismos testid que crear) y guarda. */
  async editSuite(name: string, newName: string) {
    await test.step(`Editar suite "${name}" → "${newName}"`, async () => {
      await this.page.getByRole("row", { name }).getByTestId("testsuite-edit-button").click();
      await this.page.getByTestId("testsuite-name-input").fill(newName);
      await this.page.getByTestId("testsuite-save-button").click();
      await expect(this.page.getByTestId("testsuite-save-button")).toBeHidden();
    });
  }

  /** Ubica la fila por nombre, clickea "Eliminar" y confirma el modal. */
  async deleteSuite(name: string) {
    await test.step(`Borrar suite "${name}"`, async () => {
      await this.page.getByRole("row", { name }).getByTestId("testsuite-delete-button").click();
      await this.page.getByTestId("confirm-accept-button").click();
    });
  }

  async expectSuiteVisible(name: string) {
    await test.step(`Verificar que "${name}" aparece en el listado`, async () => {
      await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
    });
  }

  async expectSuiteNotVisible(name: string) {
    await test.step(`Verificar que "${name}" ya no aparece en el listado`, async () => {
      await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);
    });
  }
}
