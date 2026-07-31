import { expect, type Page } from "@playwright/test";

export class RequirementsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/requirements");
  }

  async clickNewRequirement() {
    // El botón "Nuevo Requerimiento" solo aparece si el rol tiene permiso
    // (líder/builder). El usuario PRO de seed es dueño de sus proyectos,
    // así que siempre lo tiene.
    await this.page.getByRole("button", { name: /Nuevo Requerimiento/i }).click();
    await this.page.waitForURL("**/requirements/new");
  }

  /** Completa y envía el form de alta. Asume que ya hay al menos una Feature
   *  cargada en el proyecto activo (el combo "Funcionalidad" la necesita). */
  async createRequirement(data: {
    title: string;
    featureId: number;
    description?: string;
    acceptanceCriteria?: string;
  }) {
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
  }

  async expectRequirementVisible(title: string) {
    await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
  }
}
