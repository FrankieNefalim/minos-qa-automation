// Config centralizada leída de variables de entorno (ver .env.example).
// No usamos una librería de .env: Playwright ya carga dotenv si existe
// un archivo `.env` gracias a `dotenv/config` importado en playwright.config.ts.

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Copiá .env.example a .env y completala.`);
  }
  return value;
}

export const env = {
  baseURL: process.env.BASE_URL || "http://localhost:5173",
  apiURL: process.env.API_URL || "http://localhost:8000",

  // Usuario PRO seedeado por defecto en MINOS (backend/seed_demo_users.py)
  proUser: {
    email: process.env.PRO_USER_EMAIL || "pro@qapal.local",
    password: process.env.PRO_USER_PASSWORD || "Pro123!",
  },
};

export function requireEnv(name: string): string {
  return required(name);
}
