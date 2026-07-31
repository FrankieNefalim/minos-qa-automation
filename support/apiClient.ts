import { request, type APIRequestContext } from "@playwright/test";
import { env } from "./env";

/**
 * Cliente liviano contra la API de MINOS, para setup/teardown de datos de
 * test (crear proyecto, crear feature) sin pasar por la UI — más rápido y
 * más robusto que armar cada precondición clickeando.
 *
 * La UI se reserva para lo que el test realmente quiere validar.
 */
export class ApiClient {
  private constructor(private readonly ctx: APIRequestContext, private readonly token: string) {}

  static async loginAs(email: string, password: string): Promise<ApiClient> {
    const ctx = await request.newContext({ baseURL: env.apiURL });
    const res = await ctx.post("/auth/login", {
      form: { username: email, password },
    });
    if (!res.ok()) {
      throw new Error(`Login de API falló (${res.status()}): ${await res.text()}`);
    }
    const body = await res.json();
    return new ApiClient(ctx, body.access_token as string);
  }

  private authHeaders() {
    return { Authorization: `Bearer ${this.token}` };
  }

  async createProject(name: string): Promise<{ id: number; name: string; code: string }> {
    const res = await this.ctx.post("/projects/", {
      headers: this.authHeaders(),
      data: { name },
    });
    if (!res.ok()) {
      throw new Error(`No se pudo crear el proyecto de test (${res.status()}): ${await res.text()}`);
    }
    return res.json();
  }

  async createFeature(projectId: number, title: string): Promise<{ id: number; title: string }> {
    const res = await this.ctx.post("/features", {
      headers: this.authHeaders(),
      data: { project_id: projectId, title, description: "Feature creada por la suite de automatización" },
    });
    if (!res.ok()) {
      throw new Error(`No se pudo crear la feature de test (${res.status()}): ${await res.text()}`);
    }
    return res.json();
  }

  async deleteProject(projectId: number): Promise<void> {
    await this.ctx.delete(`/projects/${projectId}`, { headers: this.authHeaders() });
  }

  async dispose() {
    await this.ctx.dispose();
  }
}
