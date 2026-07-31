import { test } from "../../fixtures/testProject.fixture";
import { expect } from "@playwright/test";
import { AppShell } from "../../pages/AppShell";
import { env } from "../../support/env";

// Corre en el proyecto "chromium-free-user" (storageState de free@qapal.local,
// ver playwright.config.ts) — free@qapal.local es "el invitado": pro@qapal.local
// (vía apiClient, autenticado como owner) crea un proyecto fresco y lo invita
// con un rol puntual, y estos tests verifican qué le muestra/oculta la UI
// según ese rol. Matriz de referencia: frontend/src/lib/permissions.js.
test.describe("Permisos por rol", () => {
  test("tester: no puede crear requerimientos ni ver Funcionalidades, sí ve Ejecuciones", async ({
    page,
    apiClient,
  }) => {
    const project = await apiClient.createProject(`QA Roles Tester ${Date.now()}`);
    await apiClient.inviteMember(project.id, env.freeUser.email, "tester");

    try {
      const appShell = new AppShell(page);
      await page.goto("/dashboard");
      await appShell.selectProject(project.id);

      await page.goto("/requirements");
      await expect(page.getByRole("button", { name: /Nuevo Requerimiento/i })).toHaveCount(0);

      await expect(page.getByRole("link", { name: "Funcionalidades" })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Ejecuciones" })).toBeVisible();
    } finally {
      await apiClient.deleteProject(project.id).catch(() => {});
    }
  });

  test("builder: puede crear requerimientos pero no ve Funcionalidades", async ({ page, apiClient }) => {
    const project = await apiClient.createProject(`QA Roles Builder ${Date.now()}`);
    await apiClient.inviteMember(project.id, env.freeUser.email, "builder");

    try {
      const appShell = new AppShell(page);
      await page.goto("/dashboard");
      await appShell.selectProject(project.id);

      await page.goto("/requirements");
      await expect(page.getByRole("button", { name: /Nuevo Requerimiento/i })).toBeVisible();

      await expect(page.getByRole("link", { name: "Funcionalidades" })).toHaveCount(0);
    } finally {
      await apiClient.deleteProject(project.id).catch(() => {});
    }
  });

  test("stakeholder: no puede crear requerimientos ni issues, no ve Ejecuciones", async ({ page, apiClient }) => {
    const project = await apiClient.createProject(`QA Roles Stakeholder ${Date.now()}`);
    await apiClient.inviteMember(project.id, env.freeUser.email, "stakeholder");

    try {
      const appShell = new AppShell(page);
      await page.goto("/dashboard");
      await appShell.selectProject(project.id);

      await page.goto("/requirements");
      await expect(page.getByRole("button", { name: /Nuevo Requerimiento/i })).toHaveCount(0);

      await expect(page.getByRole("link", { name: "Ejecuciones" })).toHaveCount(0);

      await page.goto("/issues");
      await expect(page.getByTestId("issue-new-button")).toHaveCount(0);
    } finally {
      await apiClient.deleteProject(project.id).catch(() => {});
    }
  });
});
