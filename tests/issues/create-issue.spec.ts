import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { IssuesPage } from "../../pages/IssuesPage";

test.describe("Issues", () => {
  test("crear un issue manual lo muestra en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const issuesPage = new IssuesPage(page);
    const title = `Issue automatizado ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await issuesPage.goto();
    await issuesPage.createIssue({
      title,
      description: "Creado por la suite de automatización de MINOS.",
    });

    await issuesPage.expectIssueVisible(title);
  });
});
