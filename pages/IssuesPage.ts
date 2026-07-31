import { expect, test, type Page } from "@playwright/test";

export class IssuesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await test.step("Ir a /issues", async () => {
      await this.page.goto("/issues");
    });
  }

  /** Crea un issue manual (sin IA): solo el título es obligatorio. */
  async createIssue(data: { title: string; description?: string }) {
    await test.step(`Crear issue "${data.title}"`, async () => {
      await this.page.getByTestId("issue-new-button").click();
      await this.page.waitForURL("**/issues/new");

      await this.page.getByTestId("issue-title-input").fill(data.title);
      if (data.description) {
        await this.page.getByTestId("issue-description-textarea").fill(data.description);
      }

      await this.page.getByTestId("issue-submit-button").click();
      await this.page.waitForURL("**/issues");
    });
  }

  /** Ubica la fila por título, va a /issues/:id/edit (mismos testid que crear) y guarda. */
  async editIssue(title: string, newTitle: string) {
    await test.step(`Editar issue "${title}" → "${newTitle}"`, async () => {
      await this.page.getByRole("row", { name: title }).getByTestId("issue-list-edit-button").click();
      await this.page.waitForURL("**/issues/*/edit");
      await this.page.getByTestId("issue-title-input").fill(newTitle);
      await this.page.getByTestId("issue-submit-button").click();
      await this.page.waitForURL("**/issues");
    });
  }

  /** Ubica la fila por título, entra al detalle, borra y confirma el modal. */
  async deleteIssue(title: string) {
    await test.step(`Borrar issue "${title}"`, async () => {
      await this.page.getByRole("row", { name: title }).getByTestId("issue-view-button").click();
      await this.page.waitForURL("**/issues/*");
      await this.page.getByTestId("issue-delete-button").click();
      await this.page.getByTestId("confirm-accept-button").click();
      await this.page.waitForURL("**/issues");
    });
  }

  async expectIssueVisible(title: string) {
    await test.step(`Verificar que "${title}" aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
    });
  }

  async expectIssueNotVisible(title: string) {
    await test.step(`Verificar que "${title}" ya no aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true })).toHaveCount(0);
    });
  }
}
