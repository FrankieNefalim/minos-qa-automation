import { expect, test, type Page } from "@playwright/test";

export class ProjectMembersPage {
  constructor(private readonly page: Page) {}

  async goto(projectId: number) {
    await test.step(`Ir a /projects/${projectId}/members`, async () => {
      await this.page.goto(`/projects/${projectId}/members`);
    });
  }

  /** Invita por email. Si el email ya es un usuario activo (ej.
   *  free@qapal.local) queda agregado directo a la tabla de miembros, sin
   *  pasar por el flujo de aceptar invitación. */
  async inviteMember(email: string, role: "manager" | "builder" | "tester" | "stakeholder") {
    await test.step(`Invitar "${email}" como ${role}`, async () => {
      await this.page.getByTestId("member-invite-button").click();
      await this.page.getByTestId("member-invite-email-input").fill(email);
      await this.page.getByTestId("member-invite-role-select").selectOption(role);
      await this.page.getByTestId("member-invite-submit-button").click();
      await expect(this.page.getByTestId("member-invite-submit-button")).toBeHidden();
    });
  }

  /** Ubica la fila del miembro por email, clickea "Eliminar" y confirma el modal. */
  async removeMember(email: string) {
    await test.step(`Quitar miembro "${email}"`, async () => {
      await this.page.getByRole("row", { name: email }).getByTestId("member-remove-button").click();
      await this.page.getByTestId("confirm-accept-button").click();
    });
  }

  async expectMemberVisible(email: string) {
    await test.step(`Verificar que "${email}" aparece en la tabla de miembros`, async () => {
      await expect(this.page.getByText(email, { exact: true }).first()).toBeVisible();
    });
  }

  async expectMemberNotVisible(email: string) {
    await test.step(`Verificar que "${email}" ya no aparece en la tabla de miembros`, async () => {
      await expect(this.page.getByText(email, { exact: true })).toHaveCount(0);
    });
  }
}
