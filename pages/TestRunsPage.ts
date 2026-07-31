import { expect, test, type Page } from "@playwright/test";

export class TestRunsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await test.step("Ir a /testruns", async () => {
      await this.page.goto("/testruns");
    });
  }

  async createRun(data: { name: string; suiteId: number; result?: "passed" | "failed" | "blocked" | "not_run" }) {
    await test.step(`Crear ejecución "${data.name}"`, async () => {
      await this.page.getByTestId("testrun-new-button").click();
      await this.page.getByTestId("testrun-name-input").fill(data.name);
      await this.page.getByTestId("testrun-suite-select").selectOption(String(data.suiteId));
      if (data.result) {
        await this.page.getByTestId("testrun-result-select").selectOption(data.result);
      }
      await this.page.getByTestId("testrun-save-button").click();
      await expect(this.page.getByTestId("testrun-save-button")).toBeHidden();
    });
  }

  async expectRunVisible(name: string) {
    await test.step(`Verificar que "${name}" aparece en el listado`, async () => {
      await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
    });
  }
}
