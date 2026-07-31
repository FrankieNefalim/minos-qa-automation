import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { NotesPage } from "../../pages/NotesPage";

test.describe("Notas — edición y borrado", () => {
  test("editar el contenido de una nota mantiene su título visible en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const notesPage = new NotesPage(page);
    const title = `Nota editable ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await notesPage.goto();
    await notesPage.createNote({ title, content: "Contenido original." });
    await notesPage.expectNoteVisible(title);

    await notesPage.editNote(title, { content: "Contenido actualizado por la suite de automatización." });
    await notesPage.expectNoteVisible(title);
  });

  test("borrar una nota la quita del listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const notesPage = new NotesPage(page);
    const title = `Nota borrable ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await notesPage.goto();
    await notesPage.createNote({ title, content: "Contenido a borrar." });
    await notesPage.expectNoteVisible(title);

    await notesPage.deleteNote(title);
    await notesPage.expectNoteNotVisible(title);
  });
});
