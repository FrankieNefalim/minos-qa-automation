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
npm run report        # abre el último reporte HTML de Playwright
npm run allure:report # genera y abre el reporte de Allure
```

> ⚠️ **Rate limit de login**: `/auth/login` en MINOS permite 5 intentos por minuto (por IP+email) — es una protección real del backend, no algo para debilitar. Una corrida completa de la suite usa 3 de esos 5 (login de UI, el test de login inválido, y el token de API). Si corrés la suite dos veces seguidas en menos de un minuto, la segunda puede toparse con el límite — `auth.setup.ts` y `support/apiClient.ts` ya reintentan con backoff, pero si corrés todo muy seguido igual puede fallar. Esperá ~60s entre corridas completas si estás iterando rápido.

## Reporte con Allure

Cada test corre con dos reporters a la vez: el HTML nativo de Playwright (`npm run report`, no necesita nada extra) y Allure (`npm run allure:report`), que arma un reporte navegable con la jerarquía completa de pasos.

- **`npm run allure:generate`** transforma `allure-results/` (lo que va dejando cada corrida) en el HTML final en `allure-report/`.
- **`npm run allure:open`** lo sirve y abre en el navegador.
- **`npm run allure:report`** hace las dos cosas seguidas.

> ⚠️ **Allure necesita Java** instalado (JRE 8+) para generar/abrir el reporte — `allure-commandline` es solo un wrapper del `.jar`. `allure-results/` se genera igual sin Java (esa parte la escribe `allure-playwright` en Node puro); lo que no funciona sin Java es el paso de `generate`/`open`. Si te tira error de "java: command not found", instalá un JDK y volvé a intentar.

`allure-results/` y `allure-report/` están gitignoreados — son artefactos de cada corrida, no se versionan.

### Steps en los Page Objects

Todos los métodos públicos de los Page Objects (`pages/*.ts`) y del cliente de API (`support/apiClient.ts`) están envueltos en `test.step(...)`. Esto hace que tanto el reporte de Playwright como el de Allure muestren una jerarquía legible de lo que hizo el test — incluyendo el setup por fixture (crear proyecto/feature/suite por API), no solo las acciones dentro del test — en vez de un log plano de clicks y fills. Si agregás un método nuevo a un Page Object, envolvelo en `test.step("descripción", async () => { ... })` para mantener el mismo patrón.

## Cómo está armado

```
tests/
  auth.setup.ts               → loguea una vez por UI y guarda la sesión (storageState)
  apiAuth.setup.ts            → pide un token de API una sola vez para toda la corrida
  auth/login.spec.ts          → prueba el login en sí (corre sin sesión previa)
  requirements/*.spec.ts      → requiere sesión (storageState)
  features/*.spec.ts          → ídem
  testsuites/*.spec.ts        → ídem
  testruns/*.spec.ts          → ídem
  testcases/*.spec.ts         → ídem
  issues/*.spec.ts            → ídem
pages/                        → Page Objects (un archivo por pantalla/componente de la app)
fixtures/                     → fixtures de Playwright (datos de test vía API)
support/
  env.ts                      → config centralizada (URLs, credenciales)
  apiClient.ts                 → cliente HTTP contra la API de MINOS, para setup/teardown de datos
playwright/.auth/             → sesión + token guardados (gitignoreado, se regenera solo)
```

**Patrón de auth (UI)**: en vez de loguear por UI en cada test (lento), `auth.setup.ts` loguea una sola vez al arrancar la suite y guarda cookies/localStorage. Los tests bajo `chromium` arrancan directo con sesión activa. El propio flujo de login se prueba aparte, en el proyecto `chromium-no-auth`, que sí arranca sin sesión (ver `playwright.config.ts`).

**Patrón de auth (API)**: `apiAuth.setup.ts` pide un access_token una sola vez y lo guarda en `playwright/.auth/api-token.json`. El fixture `apiClient` (worker-scoped, en `fixtures/testProject.fixture.ts`) lo lee de ahí en vez de loguear de nuevo por worker — clave para no chocar con el rate-limit cuando corren varios workers en paralelo.

**Patrón de datos de test**: para tests que necesitan un proyecto/feature/suite ya creados, no dependas de datos cargados a mano en la cuenta de demo — usá el fixture `testProject` (`fixtures/testProject.fixture.ts`), que crea un proyecto + feature + test suite por API antes del test y borra el proyecto después. Mantiene los tests independientes entre sí y repetibles. Los códigos de proyecto se generan al azar (con reintento si chocan) porque MINOS deriva el código del nombre y lo trunca a 2 caracteres — dos proyectos con nombres parecidos pueden derivar el mismo código.

## Nota sobre selectores: `data-testid`

Los componentes de formulario compartidos de MINOS (`InputField`, `TextareaField`, `SelectField`, `ButtonPrimary`, `ButtonSecondary`, `ButtonDanger`, `TagsInput`, y las acciones de `Modal`) ahora soportan `data-testid` — se agregó como parte de esta suite, porque los inputs no asociaban `<label>` con `<input>` y no había forma estable de apuntarles sin depender de texto traducible o del orden de los campos. Los Page Objects nuevos (`FeaturesPage`, `TestSuitesPage`, `TestRunsPage`, `TestCasesPage`, `IssuesPage`) usan `page.getByTestId(...)`. `TestCaseForm` (el form más grande de la app) está completamente instrumentado, aunque los tests hoy solo ejercitan el camino mínimo (título + un paso).

`RequirementsPage` y `LoginPage` son anteriores a ese cambio y todavía usan atributos `name` (`input[name="title"]`), que también son estables en esos formularios puntuales. Si los tocás, considerá migrarlos a `data-testid` para que todo el repo siga un solo patrón.

Convención de nombres usada: `{entidad}-{campo}-{tipo}` (ej. `feature-title-input`, `testrun-save-button`).

## Agregar un test nuevo

1. Si la pantalla es nueva y usa los componentes compartidos de formulario, agregales `data-testid` en `qa-pal-mvp` (son props que ya se forwardean, un solo lugar por componente) y armá el Page Object acá apuntando a esos testid.
2. Si el test necesita sesión, ponelo en una carpeta bajo `tests/` — corre automáticamente con el storageState. Si el test necesita arrancar deslogueado, agregalo al patrón `testIgnore`/`testMatch` de `chromium-no-auth` en `playwright.config.ts`.
3. Si necesitás datos previos (proyecto, feature, suite, requerimiento, etc.), extendé `support/apiClient.ts` con el endpoint que haga falta. Si es un dato común a muchos tests, sumalo al fixture `testProject`; si es específico de un flujo, creá los datos dentro del test mismo usando `apiClient` (fixture worker-scoped, ya autenticado).

## Bugs reales encontrados armando esta suite (ya arreglados en `qa-pal-mvp`)

Automatizar esto encontró 3 bugs genuinos de la app, no errores de los tests:

1. **Login con contraseña incorrecta mostraba "tu sesión expiró" en vez de "credenciales inválidas"** — el interceptor global de 401 en `fetchWithAuth.js` no distinguía un 401 del propio login de un 401 de sesión vencida.
2. **"Crear Issue con IA" tiraba 500 siempre** — usaba `TestRun` sin importarlo, y además el chequeo de permisos estaba armado para un modelo con `project_id` propio, que `TestRunResult` no tiene.
3. **Borrar un proyecto con casos de prueba, planes, ejecuciones, issues o notas tiraba 500** — esas 5 tablas no tenían `ON DELETE CASCADE` hacia `projects` (a diferencia de `features`/`requirements`, que sí).

## Sobre la concurrencia entre tests

Todos los tests pegan contra la misma cuenta de demo compartida (`pro@qapal.local`). Con 3 workers en paralelo, de vez en cuando hay contención puntual (ej. generación de key por proyecto) que hace fallar un test de forma transitoria — no es un bug de la app ni del test, así que `playwright.config.ts` tiene `retries: 1` en local (2 en CI) para absorber eso. Si un test falla dos veces seguidas, ahí sí es señal de algo real.

## Pendiente / ideas para crecer esto

- Sumar Page Objects para Planes de Prueba y Notas.
- Flujos de edición/borrado (hoy todo es "crear") y tests de permisos por rol (tester/builder/stakeholder, no solo el owner Pro).
- CI: correr `npm test` en GitHub Actions contra un `docker compose up` efímero.
- Cross-browser: ya está preparado en `playwright.config.ts` (proyectos de firefox/webkit comentados), solo hay que descomentar.
