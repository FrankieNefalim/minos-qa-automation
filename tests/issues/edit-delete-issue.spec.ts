import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { IssuesPage } from "../../pages/IssuesPage";

test.describe("Issues — edición y borrado", () => {
  test("editar el título de un issue lo refleja en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const issuesPage = new IssuesPage(page);
    const title = `Issue editable ${Date.now()}`;
    const newTitle = `${title} (editado)`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await issuesPage.goto();
    await issuesPage.createIssue({ title });
    await issuesPage.expectIssueVisible(title);

    await issuesPage.editIssue(title, newTitle);
    await issuesPage.expectIssueVisible(newTitle);
  });

  test("borrar un issue lo quita del listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const issuesPage = new IssuesPage(page);
    const title = `Issue borrable ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await issuesPage.goto();
    await issuesPage.createIssue({ title });
    await issuesPage.expectIssueVisible(title);

    await issuesPage.deleteIssue(title);
    await issuesPage.expectIssueNotVisible(title);
  });
});
