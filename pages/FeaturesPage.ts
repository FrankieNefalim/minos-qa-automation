import { expect, test, type Page } from "@playwright/test";

export class FeaturesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await test.step("Ir a /features", async () => {
      await this.page.goto("/features");
    });
  }

  async createFeature(data: { title: string; description?: string }) {
    await test.step(`Crear funcionalidad "${data.title}"`, async () => {
      await this.page.getByTestId("feature-new-button").click();
      await this.page.getByTestId("feature-title-input").fill(data.title);
      if (data.description) {
        await this.page.getByTestId("feature-description-textarea").fill(data.description);
      }
      await this.page.getByTestId("feature-save-button").click();
      // El modal se cierra solo al guardar con éxito.
      await expect(this.page.getByTestId("feature-save-button")).toBeHidden();
    });
  }

  /** Ubica la fila por título, abre el modal de edición (mismos testid que crear) y guarda. */
  async editFeature(title: string, newTitle: string) {
    await test.step(`Editar funcionalidad "${title}" → "${newTitle}"`, async () => {
      await this.page.getByRole("row", { name: title }).getByTestId("feature-edit-button").click();
      await this.page.getByTestId("feature-title-input").fill(newTitle);
      await this.page.getByTestId("feature-save-button").click();
      await expect(this.page.getByTestId("feature-save-button")).toBeHidden();
    });
  }

  /** Ubica la fila por título, clickea "Eliminar" y confirma el modal. */
  async deleteFeature(title: string) {
    await test.step(`Borrar funcionalidad "${title}"`, async () => {
      await this.page.getByRole("row", { name: title }).getByTestId("feature-delete-button").click();
      await this.page.getByTestId("confirm-accept-button").click();
    });
  }

  async expectFeatureVisible(title: string) {
    await test.step(`Verificar que "${title}" aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
    });
  }

  async expectFeatureNotVisible(title: string) {
    await test.step(`Verificar que "${title}" ya no aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true })).toHaveCount(0);
    });
  }
}
