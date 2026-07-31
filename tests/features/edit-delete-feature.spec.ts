import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { FeaturesPage } from "../../pages/FeaturesPage";

test.describe("Funcionalidades — edición y borrado", () => {
  test("editar el título de una funcionalidad lo refleja en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const featuresPage = new FeaturesPage(page);
    const title = `Funcionalidad editable ${Date.now()}`;
    const newTitle = `${title} (editada)`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await featuresPage.goto();
    await featuresPage.createFeature({ title });
    await featuresPage.expectFeatureVisible(title);

    await featuresPage.editFeature(title, newTitle);
    await featuresPage.expectFeatureVisible(newTitle);
  });

  test("borrar una funcionalidad la quita del listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const featuresPage = new FeaturesPage(page);
    const title = `Funcionalidad borrable ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await featuresPage.goto();
    await featuresPage.createFeature({ title });
    await featuresPage.expectFeatureVisible(title);

    await featuresPage.deleteFeature(title);
    await featuresPage.expectFeatureNotVisible(title);
  });
});
