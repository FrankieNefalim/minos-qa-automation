import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Page Object de /login.
 *
 * Nota de selectores: los <InputField> de MINOS no asocian el <label> con el
 * <input> (falta id/htmlFor), así que Playwright's getByLabel() no funciona
 * de forma confiable acá. Usamos los atributos `name`, que sí son estables
 * porque los consume el propio formulario del componente.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('form button[type="submit"]');
    this.errorMessage = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Login y espera a que la SPA navegue lejos de /login (dashboard, admin, onboarding, etc.). */
  async loginAndWaitForRedirect(email: string, password: string) {
    await this.login(email, password);
    await this.page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15_000 });
  }

  async expectError(messageSubstring?: string | RegExp) {
    await expect(this.errorMessage).toBeVisible();
    if (messageSubstring) {
      await expect(this.errorMessage).toContainText(messageSubstring);
    }
  }
}
