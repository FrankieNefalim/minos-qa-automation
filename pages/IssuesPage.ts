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

  async expectIssueVisible(title: string) {
    await test.step(`Verificar que "${title}" aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
    });
  }
}
