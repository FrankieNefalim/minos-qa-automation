import { test } from "../../fixtures/testProject.fixture";
import { ProjectsPage } from "../../pages/ProjectsPage";

test.describe("Proyectos", () => {
  test("crear un proyecto nuevo lo muestra en el listado", async ({ page, apiClient }) => {
    const projectsPage = new ProjectsPage(page);
    const name = `Proyecto automatizado ${Date.now()}`;

    try {
      await projectsPage.goto();
      await projectsPage.createProject({
        name,
        objective: "Creado por la suite de automatización de MINOS.",
      });
      await projectsPage.expectProjectVisible(name);
    } finally {
      const projectId = await apiClient.findProjectIdByName(name);
      if (projectId) await apiClient.deleteProject(projectId).catch(() => {});
    }
  });

  test("editar el nombre de un proyecto lo refleja en el listado", async ({ page, apiClient }) => {
    const projectsPage = new ProjectsPage(page);
    const name = `Proyecto editable ${Date.now()}`;
    const newName = `${name} (editado)`;

    try {
      await projectsPage.goto();
      await projectsPage.createProject({ name });
      await projectsPage.expectProjectVisible(name);

      await projectsPage.editProject(name, newName);
      await projectsPage.expectProjectVisible(newName);
    } finally {
      const projectId = await apiClient.findProjectIdByName(newName);
      if (projectId) await apiClient.deleteProject(projectId).catch(() => {});
    }
  });

  test("borrar un proyecto lo quita del listado", async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    const name = `Proyecto borrable ${Date.now()}`;

    await projectsPage.goto();
    await projectsPage.createProject({ name });
    await projectsPage.expectProjectVisible(name);

    await projectsPage.deleteProject(name);
    await projectsPage.expectProjectNotVisible(name);
  });
});
