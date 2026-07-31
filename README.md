# MINOS QA Automation

Suite de tests E2E para [MINOS](../qa-pal-mvp) armada con **Playwright + TypeScript**. Vive en un repo separado a propósito, para no meter ruido en el repo de la app.

## Requisitos

- MINOS corriendo localmente (`docker compose up -d` en el repo de la app) — backend en `:8000`, frontend en `:5173`.
- Node.js 20+.

## Setup

```bash
npm install
npx playwright install --with-deps chromium   # descarga el browser
cp .env.example .env                            # ajustá si tu instancia corre en otro lado
```

## Correr los tests

```bash
npm test              # headless, todos los tests
npm run test:headed   # con el browser visible
npm run test:ui       # UI mode de Playwright (recomendado mientras escribís tests nuevos)
npm run test:debug    # paso a paso
npm run report        # abre el último reporte HTML
```

## Cómo está armado

```
tests/
  auth.setup.ts              → loguea una vez por UI y guarda la sesión (storageState)
  auth/login.spec.ts         → prueba el login en sí (corre sin sesión previa)
  requirements/*.spec.ts     → tests que ya arrancan logueados
pages/                       → Page Objects (un archivo por pantalla/componente de la app)
fixtures/                    → fixtures de Playwright (datos de test vía API)
support/
  env.ts                     → config centralizada (URLs, credenciales)
  apiClient.ts                → cliente HTTP contra la API de MINOS, para setup/teardown de datos
playwright/.auth/            → sesión guardada (gitignoreado, se regenera solo)
```

**Patrón de auth**: en vez de loguear por UI en cada test (lento), `auth.setup.ts` loguea una sola vez al arrancar la suite y guarda cookies/localStorage. Los tests del proyecto `chromium` arrancan directo con sesión activa. El propio flujo de login se prueba aparte, en el proyecto `chromium-no-auth`, que sí arranca sin sesión (ver `playwright.config.ts`).

**Patrón de datos de test**: para tests que necesitan un proyecto/feature ya creados (como crear un requerimiento), no dependas de datos cargados a mano en la cuenta de demo — usá el fixture `testProject` (`fixtures/testProject.fixture.ts`), que crea un proyecto + feature por API antes del test y los borra después. Mantiene los tests independientes entre sí y repetibles.

## Nota sobre selectores

Los inputs de MINOS hoy no asocian el `<label>` con su `<input>` (falta `id`/`htmlFor`), así que `getByLabel()` de Playwright no es confiable en esta app todavía. Los Page Objects usan atributos `name` (`input[name="title"]`, etc.), que sí son estables porque los define el propio formulario. Si en algún momento se agregan `data-testid` a los componentes de UI (`InputField`, `SelectField`, `ButtonPrimary`...), migrar los selectores sería una mejora de una sola vez, no haría falta tocar cada test.

## Agregar un test nuevo

1. Si la pantalla es nueva, sumá un Page Object en `pages/` (mirá `RequirementsPage.ts` como referencia).
2. Si el test necesita sesión, ponelo en una carpeta bajo `tests/` — corre automáticamente con el storageState. Si el test necesita arrancar deslogueado, agregalo al patrón `testIgnore`/`testMatch` de `chromium-no-auth` en `playwright.config.ts`.
3. Si necesitás datos previos (proyecto, feature, requerimiento, etc.), extendé `support/apiClient.ts` con el endpoint que haga falta y armá un fixture nuevo siguiendo el patrón de `testProject.fixture.ts`.

## Pendiente / ideas para crecer esto

- Sumar más Page Objects a medida que se automatizan otras pantallas (Casos de Prueba, Suites, Planes, Ejecuciones, Issues).
- CI: correr `npm test` en GitHub Actions contra un `docker compose up` efímero.
- Cross-browser: ya está preparado en `playwright.config.ts` (proyectos de firefox/webkit comentados), solo hay que descomentar.
