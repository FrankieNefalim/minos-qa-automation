import { expect, type Page } from "@playwright/test";

export class FeaturesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/features");
  }

  async createFeature(data: { title: string; description?: string }) {
    await this.page.getByTestId("feature-new-button").click();
    await this.page.getByTestId("feature-title-input").fill(data.title);
    if (data.description) {
      await this.page.getByTestId("feature-description-textarea").fill(data.description);
    }
    await this.page.getByTestId("feature-save-button").click();
    // El modal se cierra solo al guardar con éxito.
    await expect(this.page.getByTestId("feature-save-button")).toBeHidden();
  }

  async expectFeatureVisible(title: string) {
    await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
  }
}
