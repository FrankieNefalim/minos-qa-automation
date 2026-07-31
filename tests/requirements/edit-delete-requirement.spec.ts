import { test } from "../../fixtures/testProject.fixture";
import { AppShell } from "../../pages/AppShell";
import { RequirementsPage } from "../../pages/RequirementsPage";

test.describe("Requerimientos — edición y borrado", () => {
  test("editar el título de un requerimiento lo refleja en el listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const requirementsPage = new RequirementsPage(page);
    const title = `Requerimiento editable ${Date.now()}`;
    const newTitle = `${title} (editado)`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await requirementsPage.goto();
    await requirementsPage.clickNewRequirement();
    await requirementsPage.createRequirement({ title, featureId: testProject.featureId });
    await requirementsPage.expectRequirementVisible(title);

    await requirementsPage.editRequirement(title, newTitle);
    await requirementsPage.expectRequirementVisible(newTitle);
  });

  test("borrar un requerimiento lo quita del listado", async ({ page, testProject }) => {
    const appShell = new AppShell(page);
    const requirementsPage = new RequirementsPage(page);
    const title = `Requerimiento borrable ${Date.now()}`;

    await page.goto("/dashboard");
    await appShell.selectProject(testProject.id);

    await requirementsPage.goto();
    await requirementsPage.clickNewRequirement();
    await requirementsPage.createRequirement({ title, featureId: testProject.featureId });
    await requirementsPage.expectRequirementVisible(title);

    await requirementsPage.deleteRequirement(title);
    await requirementsPage.expectRequirementNotVisible(title);
  });
});
