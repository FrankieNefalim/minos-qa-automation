import { expect, test, type Page } from "@playwright/test";

export class TestPlansPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await test.step("Ir a /testplans", async () => {
      await this.page.goto("/testplans");
    });
  }

  /** Crea un plan de prueba con el mínimo indispensable: solo el título es obligatorio. */
  async createTestPlan(data: { title: string; objective?: string }) {
    await test.step(`Crear plan de prueba "${data.title}"`, async () => {
      await this.page.getByTestId("testplan-new-button").click();
      await this.page.waitForURL("**/testplans/new");

      await this.page.locator('input[name="title"]').fill(data.title);
      if (data.objective) {
        await this.page.locator('textarea[name="objective"]').fill(data.objective);
      }

      await this.page.locator('form button[type="submit"]').click();
      await this.page.waitForURL("**/testplans");
    });
  }

  /** Ubica la card del plan por título y clickea "Editar". */
  async editTestPlan(title: string, changes: { objective?: string }) {
    await test.step(`Editar plan de prueba "${title}"`, async () => {
      const card = this.page.locator("article", { hasText: title });
      await card.getByTestId("testplan-edit-button").click();
      await this.page.waitForURL("**/testplans/*/edit");

      if (changes.objective) {
        await this.page.locator('textarea[name="objective"]').fill(changes.objective);
      }

      await this.page.locator('form button[type="submit"]').click();
      await this.page.waitForURL("**/testplans");
    });
  }

  /** Ubica la card del plan por título, clickea "Eliminar" y confirma el modal. */
  async deleteTestPlan(title: string) {
    await test.step(`Borrar plan de prueba "${title}"`, async () => {
      const card = this.page.locator("article", { hasText: title });
      await card.getByTestId("testplan-delete-button").click();
      await this.page.getByTestId("confirm-accept-button").click();
    });
  }

  async expectTestPlanVisible(title: string) {
    await test.step(`Verificar que "${title}" aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
    });
  }

  async expectTestPlanNotVisible(title: string) {
    await test.step(`Verificar que "${title}" ya no aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true })).toHaveCount(0);
    });
  }
}
