import { expect, test, type Page } from "@playwright/test";

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function randomCode(): string {
  let code = "";
  for (let i = 0; i < 2; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

export class ProjectsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await test.step("Ir a /projects", async () => {
      await this.page.goto("/projects");
    });
  }

  /** Completa y envía el form de alta en /projects/new. Solo el nombre es
   *  obligatorio; la sigla se sobreescribe con un código al azar (el que
   *  autosugiere el form a partir del nombre puede chocar con proyectos ya
   *  existentes, como pasa con la sigla del propio proyecto de la cuenta
   *  demo o con corridas previas). Para conseguir el id del proyecto creado
   *  (y poder borrarlo por API al final del test), usá
   *  `apiClient.findProjectIdByName(name)` después de llamar a este método. */
  async createProject(data: { name: string; objective?: string }) {
    await test.step(`Crear proyecto "${data.name}"`, async () => {
      await this.page.getByTestId("project-new-button").click();
      await this.page.waitForURL("**/projects/new");
      await this.page.getByTestId("project-name-input").fill(data.name);
      await this.page.getByTestId("project-code-input").fill(randomCode());
      if (data.objective) {
        await this.page.locator('textarea[name="objective"]').fill(data.objective);
      }
      await this.page.getByTestId("project-submit-button").click();
      await this.page.waitForURL("**/projects");
    });
  }

  private cardByName(name: string) {
    return this.page.locator("article", { hasText: name });
  }

  /** Ubica la card por nombre, abre el modal de edición y guarda. */
  async editProject(name: string, newName: string) {
    await test.step(`Editar proyecto "${name}" → "${newName}"`, async () => {
      await this.cardByName(name).getByTestId("project-edit-button").click();
      await this.page.getByTestId("project-edit-name-input").fill(newName);
      await this.page.getByTestId("project-edit-save-button").click();
      await expect(this.page.getByTestId("project-edit-save-button")).toBeHidden();
    });
  }

  /** Ubica la card por nombre, clickea "Eliminar" y confirma el modal. */
  async deleteProject(name: string) {
    await test.step(`Borrar proyecto "${name}"`, async () => {
      await this.cardByName(name).getByTestId("project-delete-button").click();
      await this.page.getByTestId("confirm-accept-button").click();
    });
  }

  async expectProjectVisible(name: string) {
    await test.step(`Verificar que "${name}" aparece en el listado`, async () => {
      await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
    });
  }

  async expectProjectNotVisible(name: string) {
    await test.step(`Verificar que "${name}" ya no aparece en el listado`, async () => {
      await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);
    });
  }
}
