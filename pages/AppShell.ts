import type { Page } from "@playwright/test";

/**
 * Elementos de layout compartidos por casi toda la app logueada:
 * el selector de proyecto activo (Header) y la navegación (Sidebar).
 */
export class AppShell {
  constructor(private readonly page: Page) {}

  /** Cambia el proyecto activo por su ID (más confiable que matchear texto,
   *  porque la opción muestra "{code}-0000 · {nombre}", no solo el nombre). */
  async selectProject(projectId: number) {
    const select = this.page.locator("header select");
    await select.selectOption(String(projectId));
  }

  async gotoRequirements() {
    await this.page.goto("/requirements");
  }
}
