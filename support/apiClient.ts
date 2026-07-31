import { request, test, type APIRequestContext } from "@playwright/test";
import { env } from "./env";

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomCode(): string {
  let code = "";
  for (let i = 0; i < 2; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cliente liviano contra la API de MINOS, para setup/teardown de datos de
 * test (crear proyecto, crear feature) sin pasar por la UI — más rápido y
 * más robusto que armar cada precondición clickeando.
 *
 * La UI se reserva para lo que el test realmente quiere validar.
 */
export class ApiClient {
  private constructor(private readonly ctx: APIRequestContext, private readonly token: string) {}

  /**
   * Pide un access_token a la API. El backend rate-limitea /auth/login
   * (protección anti-fuerza-bruta), así que si varios procesos loguean casi
   * al mismo tiempo puede devolver 429 — reintentamos con backoff.
   *
   * Usá esto UNA sola vez por corrida completa (ver tests/apiAuth.setup.ts),
   * no una vez por worker ni por test: incluso con reintentos, varios
   * workers logueando en paralelo alcanzan a agotar el rate-limit.
   */
  static async fetchToken(email: string, password: string): Promise<string> {
    return test.step(`API: obtener token para ${email}`, async () => {
      const ctx = await request.newContext({ baseURL: env.apiURL });
      try {
        let lastError = "";
        for (let attempt = 1; attempt <= 5; attempt++) {
          const res = await ctx.post("/auth/login", {
            form: { username: email, password },
          });
          if (res.ok()) {
            const body = await res.json();
            return body.access_token as string;
          }
          if (res.status() !== 429) {
            throw new Error(`Login de API falló (${res.status()}): ${await res.text()}`);
          }
          lastError = await res.text();
          await sleep(attempt * 2000); // backoff: 2s, 4s, 6s, 8s...
        }
        throw new Error(`Login de API rate-limiteado tras varios reintentos: ${lastError}`);
      } finally {
        await ctx.dispose();
      }
    });
  }

  /** Construye un cliente a partir de un token ya obtenido (ver fetchToken). */
  static async fromToken(token: string): Promise<ApiClient> {
    const ctx = await request.newContext({ baseURL: env.apiURL });
    return new ApiClient(ctx, token);
  }

  private authHeaders() {
    return { Authorization: `Bearer ${this.token}` };
  }

  /**
   * Crea un proyecto con un código de 2 caracteres generado al azar. El
   * backend deriva el código del nombre y lo trunca a 2 chars, así que dos
   * proyectos con nombres tipo "QA Automation <ts>" chocan en el mismo
   * código "QA" — mandamos el código explícito para evitarlo, y reintentamos
   * con otro código al azar si por mala suerte ya existe.
   */
  async createProject(name: string): Promise<{ id: number; name: string; code: string }> {
    return test.step(`API: crear proyecto "${name}"`, async () => {
      let lastError = "";
      for (let attempt = 1; attempt <= 5; attempt++) {
        const code = randomCode();
        const res = await this.ctx.post("/projects/", {
          headers: this.authHeaders(),
          data: { name, code },
        });
        if (res.ok()) return res.json();
        lastError = await res.text();
        if (!lastError.includes("already exists")) {
          throw new Error(`No se pudo crear el proyecto de test (${res.status()}): ${lastError}`);
        }
      }
      throw new Error(`No se pudo crear el proyecto de test tras varios códigos: ${lastError}`);
    });
  }

  async createFeature(projectId: number, title: string): Promise<{ id: number; title: string }> {
    return test.step(`API: crear feature "${title}" (proyecto ${projectId})`, async () => {
      const res = await this.ctx.post("/features", {
        headers: this.authHeaders(),
        data: { project_id: projectId, title, description: "Feature creada por la suite de automatización" },
      });
      if (!res.ok()) {
        throw new Error(`No se pudo crear la feature de test (${res.status()}): ${await res.text()}`);
      }
      return res.json();
    });
  }

  async createTestSuite(projectId: number, name: string): Promise<{ id: number; name: string }> {
    return test.step(`API: crear test suite "${name}" (proyecto ${projectId})`, async () => {
      const res = await this.ctx.post("/testsuites/", {
        headers: this.authHeaders(),
        data: { project_id: projectId, name },
      });
      if (!res.ok()) {
        throw new Error(`No se pudo crear la test suite (${res.status()}): ${await res.text()}`);
      }
      return res.json();
    });
  }

  async deleteProject(projectId: number): Promise<void> {
    await test.step(`API: borrar proyecto ${projectId}`, async () => {
      await this.ctx.delete(`/projects/${projectId}`, { headers: this.authHeaders() });
    });
  }

  async dispose() {
    await this.ctx.dispose();
  }
}
