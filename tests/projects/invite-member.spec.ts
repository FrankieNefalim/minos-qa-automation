import { test } from "../../fixtures/testProject.fixture";
import { ProjectMembersPage } from "../../pages/ProjectMembersPage";
import { env } from "../../support/env";

test.describe("Miembros del proyecto", () => {
  test("invitar a un usuario existente lo agrega directo como miembro, y se lo puede quitar", async ({
    page,
    testProject,
  }) => {
    const membersPage = new ProjectMembersPage(page);

    await membersPage.goto(testProject.id);
    await membersPage.inviteMember(env.freeUser.email, "tester");
    await membersPage.expectMemberVisible(env.freeUser.email);

    await membersPage.removeMember(env.freeUser.email);
    await membersPage.expectMemberNotVisible(env.freeUser.email);
  });
});
