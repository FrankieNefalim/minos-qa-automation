import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { NotesPage } from "../../pages/NotesPage";

test.describe("Notas", () => {
  test("crear una nota nueva la muestra en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const notesPage = new NotesPage(page);
    const title = `Nota automatizada ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await notesPage.goto();
    await notesPage.createNote({
      title,
      content: "Creada por la suite de automatización de MINOS.",
    });

    await notesPage.expectNoteVisible(title);
  });
});
