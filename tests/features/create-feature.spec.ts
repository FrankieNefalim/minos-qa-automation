import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { FeaturesPage } from "../../pages/FeaturesPage";

test.describe("Funcionalidades", () => {
  test("crear una funcionalidad nueva la muestra en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const featuresPage = new FeaturesPage(page);
    const title = `Funcionalidad automatizada ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await featuresPage.goto();
    await featuresPage.createFeature({
      title,
      description: "Creada por la suite de automatización de MINOS.",
    });

    await featuresPage.expectFeatureVisible(title);
  });
});
