import { expect, test, type Page } from "@playwright/test";

export class NotesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await test.step("Ir a /notes", async () => {
      await this.page.goto("/notes");
    });
  }

  /** Crea una nota: título y contenido son obligatorios. */
  async createNote(data: { title: string; content: string }) {
    await test.step(`Crear nota "${data.title}"`, async () => {
      await this.page.getByTestId("note-new-button").click();
      await this.page.getByTestId("note-title-input").fill(data.title);
      await this.page.getByTestId("note-content-textarea").fill(data.content);
      await this.page.getByTestId("note-save-button").click();
      await expect(this.page.getByTestId("note-save-button")).toBeHidden();
    });
  }

  private cardByTitle(title: string) {
    return this.page.getByTestId("note-card").filter({ hasText: title });
  }

  /** Ubica la card de la nota por título y edita su contenido. */
  async editNote(title: string, changes: { content: string }) {
    await test.step(`Editar nota "${title}"`, async () => {
      await this.cardByTitle(title).getByTestId("note-edit-button").click();
      await this.page.getByTestId("note-content-textarea").fill(changes.content);
      await this.page.getByTestId("note-save-button").click();
      await expect(this.page.getByTestId("note-save-button")).toBeHidden();
    });
  }

  /** Ubica la card de la nota por título, clickea "Eliminar" y confirma el modal. */
  async deleteNote(title: string) {
    await test.step(`Borrar nota "${title}"`, async () => {
      await this.cardByTitle(title).getByTestId("note-delete-button").click();
      await this.page.getByTestId("confirm-accept-button").click();
    });
  }

  async expectNoteVisible(title: string) {
    await test.step(`Verificar que "${title}" aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
    });
  }

  async expectNoteNotVisible(title: string) {
    await test.step(`Verificar que "${title}" ya no aparece en el listado`, async () => {
      await expect(this.page.getByText(title, { exact: true })).toHaveCount(0);
    });
  }
}
