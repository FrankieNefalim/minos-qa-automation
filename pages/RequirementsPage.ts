import { expect, test, type Page } from "@playwright/test";

export class RequirementsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await test.step("Ir a /requirements", async () => {
      await this.page.goto("/requirements");
    });
  }

  async clickNewRequirement() {
    await test.step('Abrir "Nuevo Requerimiento"', async () => {
      // El botón "Nuevo Requerimiento" solo aparece si el rol tiene permiso
      // (líder/builder). El usuario PRO de seed es dueño de sus proyectos,
      // así que siempre lo tiene.
      await this.page.getByRole("button", { name: /Nuevo Requerimiento/i }).click();
      await this.page.waitForURL("**/requirements/new");
    });
  }

  /** Completa y envía el form de alta. Asume que ya hay al menos una Feature
   *  cargada en el proyecto activo (el combo "Funcionalidad" la necesita). */
  async createRequirement(data: {
    title: string;
    featureId: number;
    description?: string;
    acceptanceCriteria?: string;
  }) {
    await test.step(`Completar y enviar form de requerimiento "${data.title}"`, async () => {
      await this.page.locator('input[name="title"]').fill(data.title);
      await this.page.locator('select[name="feature_id"]').selectOption(String(data.featureId));

      if (data.description) {
        await this.page.locator('textarea[name="description"]').fill(data.description);
      }
      if (data.acceptanceCriteria) {
        await this.page.locator('textarea[name="acceptance_criteria"]').fill(data.acceptanceCriteria);
      }

      await this.page.locator('form button[type="submit"]').click();
      // Al crear, el form navega de vuelta al listado.
      await this.page.waitForURL("**/requirements");
    });
  }

  /** Ubica la fila por título en la tabla, edita el título y guarda. */
  async editRequirement(title: string, newTitle: string) {
    await test.step(`Editar requerimiento "${title}" → "${newTitle}"`, async () => {
      await this.page.getByRole("row", { name: title }).getByTestId("requirement-edit-button").click();
      await this.page.waitForURL("**/requirements/*/edit");
      await this.page.locator('input[name="title"]').fill(newTitle);
      await this.page.locator('form button[type="submit"]').click();
      await this.page.waitForURL("**/requirements");
    });
  }

  /** Ubica la fila por título, clickea "Eliminar" y confirma el modal. */
  async deleteRequirement(title: string) {
    await test.step(`Borrar requerimiento "${title}"`, async () => {
      await this.page.getByRole("row", { name: title }).getByTestId("requirement-delete-button").click();
      await this.page.getByTestId("confirm-accept-button").click();
    });
  }

  async expectRequirementVisible(title: string) {
    await test.step(`Verificar que "${title}" aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
    });
  }

  async expectRequirementNotVisible(title: string) {
    await test.step(`Verificar que "${title}" ya no aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true })).toHaveCount(0);
    });
  }
}
