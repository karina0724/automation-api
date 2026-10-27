# Library API - Automatización de Pruebas (Desafío #3)

Automatización de pruebas **funcionales** y de **integración CRUD** sobre el servicio REST
[`https://rahulshettyacademy.com/Library`](https://rahulshettyacademy.com/Library) usando
**Playwright + TypeScript**, aplicando buenas prácticas de API testing.

---

## 📋 Tabla de contenido

- [Stack](#-stack)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Ejecución](#-ejecución)
- [Reportes](#-reportes)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Cobertura de pruebas](#-cobertura-de-pruebas)
- [Manejo de datos dinámicos](#-manejo-de-datos-dinámicos)
- [Decisiones de diseño](#-decisiones-de-diseño)

---

## 🧰 Stack

| Componente        | Versión    | Motivo                                                     |
| ----------------- | ---------- | ---------------------------------------------------------- |
| Node.js           | `>=20`     | Runtime moderno con soporte nativo de ESM                  |
| TypeScript        | `^5.7`     | Tipado estricto y features recientes                       |
| `@playwright/test`| `^1.62`    | Test runner con `APIRequestContext` nativo                 |
| Zod               | `^3.23`    | Validación declarativa de contratos JSON (keys y tipos)    |
| dotenv            | `^16.4`    | Carga de variables de entorno                              |

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/karina0724/automation-api.git
cd automation-api

# 2. Instalar dependencias
npm install

# 3. (Opcional) Crear archivo .env a partir del ejemplo
cp .env.example .env
```

> No es necesario `playwright install` ni descargar navegadores: la suite usa
> únicamente el cliente HTTP (`APIRequestContext`) de Playwright.

---

## 🔐 Variables de entorno

Todas tienen un **valor por defecto** sensato, así que el proyecto corre sin crear `.env`.
Si querés sobreescribir alguna, copiá `.env.example` → `.env` y modificá:

| Variable                | Default                                      | Descripción                                                       |
| ----------------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| `BASE_URL`              | `https://rahulshettyacademy.com/Library`     | URL base del servicio REST                                        |
| `MAX_RESPONSE_TIME_MS`  | `500`                                        | Umbral de tiempo máximo aceptable por respuesta (en ms)           |
| `NON_EXISTENT_ID`       | `NO_EXISTE_000000000`                        | ID que se usa en pruebas negativas (`GetBook`, `DeleteBook`)      |
| `CI`                    | `false`                                      | `true` activa 2 retries, 1 worker y bloquea `.only`               |

---

## ▶️ Ejecución

### Todas las pruebas

```bash
npm test
```

### Sólo suite funcional (por endpoint)

```bash
npm run test:functional
```

### Sólo suite integrada (CRUD)

```bash
npm run test:integration
```

### Un endpoint específico

```bash
npm run test:addbook
npm run test:getbook
npm run test:deletebook
```

### Flujo CRUD integrado

```bash
npm run test:crud
```

### Verificación de tipos (sin ejecutar tests)

```bash
npm run typecheck
```

### Limpiar reportes previos

```bash
npm run clean
```

---

## 📊 Reportes

Al ejecutar `npm test` se generan tres reportes en paralelo:

1. **Consola (`list`)** - Progreso en vivo durante la corrida.
2. **HTML (`playwright-report/`)** - Reporte interactivo con detalle de cada test, requests,
   responses y trazas de fallos.
3. **JSON (`test-results/results.json`)** - Resultados estructurados para integración con CI.
4. **JUnit XML (`test-results/results.xml`)** - Compatible con Jenkins / GitLab / etc.

Para abrir el reporte HTML:

```bash
npm run report
```

---

## 📁 Estructura del proyecto

```
library-api-tests/
├── package.json                 # Scripts y dependencias
├── tsconfig.json                # Config TypeScript estricta
├── playwright.config.ts         # Config Playwright (timeouts, reporters, baseURL)
├── .env.example                 # Variables de entorno disponibles
├── .gitignore
├── README.md                    # Este archivo
│
├── src/
│   ├── api/
│   │   ├── bookApi.ts           # Cliente HTTP tipado (addBook / getBook / deleteBook)
│   │   └── config.ts            # Configuración central (baseURL, umbrales, endpoints)
│   ├── schemas/
│   │   └── bookSchemas.ts       # Contratos Zod (200 y 404/500) por endpoint
│   ├── fixtures/
│   │   └── apiFixture.ts        # Fixture Playwright que inyecta BookApi en los tests
│   └── utils/
│       ├── dataGenerator.ts     # Generación de datos dinámicos (ISBN/aisle únicos)
│       └── assertions.ts        # Aserciones reutilizables (status, tiempo, schema)
│
└── tests/
    ├── functional/
    │   ├── addBook.spec.ts      # Suite POST /Addbook.php    (puntos 1.a-1.e)
    │   ├── getBook.spec.ts      # Suite GET  /GetBook.php    (puntos 2.a-2.d)
    │   └── deleteBook.spec.ts   # Suite POST /DeleteBook.php (puntos 3.a-3.d)
    └── integration/
        └── crud.spec.ts         # Flujo integral CRUD        (puntos 4.i-4.iv)
```

---

## ✅ Cobertura de pruebas

### Suite funcional - **AddBook** (`tests/functional/addBook.spec.ts`)

| ID    | Validación                                                                         |
| ----- | ---------------------------------------------------------------------------------- |
| 1.a   | Código `200 OK` al agregar un libro válido                                         |
| 1.b   | Contrato JSON: keys `Msg`/`ID` y tipos (`string`), vía esquema Zod                 |
| 1.c   | Tiempo de respuesta `< 500 ms`                                                     |
| 1.d   | `ID` devuelto == `isbn + aisle` concatenados                                       |
| 1.e   | Enviar `aisle` no numérico → código `500`                                          |

### Suite funcional - **GetBook** (`tests/functional/getBook.spec.ts`)

| ID    | Validación                                                                         |
| ----- | ---------------------------------------------------------------------------------- |
| 2.a   | Código `200 OK` al consultar un libro existente                                    |
| 2.b   | Contrato JSON: array con `book_name`, `isbn`, `aisle`, `author` (string)           |
| 2.c   | Tiempo de respuesta `< 500 ms`                                                     |
| 2.d   | Consultar ID inexistente → código ≠ 200 y mensaje `"does not exists"`              |

### Suite funcional - **DeleteBook** (`tests/functional/deleteBook.spec.ts`)

| ID    | Validación                                                                         |
| ----- | ---------------------------------------------------------------------------------- |
| 3.a   | Código `200 OK` al eliminar un libro existente                                     |
| 3.b   | Contrato JSON: key `msg` (string)                                                  |
| 3.c   | Tiempo de respuesta `< 500 ms`                                                     |
| 3.d   | Eliminar ID inexistente → código ≠ 200 y mensaje `"doesnt exists"`                 |

### Suite integrada - **CRUD** (`tests/integration/crud.spec.ts`) · ejecución **serial**

| Paso  | Acción                                                              | Validaciones aplicadas       |
| ----- | ------------------------------------------------------------------- | ---------------------------- |
| i     | Crear 2 libros con datos dinámicos                                  | 1.a + 1.b + 1.c + 1.d        |
| ii    | Consultar los 2 libros creados                                      | 2.a + 2.b + 2.c              |
| iii   | Eliminar los 2 libros                                               | 3.a + 3.b + 3.c              |
| iv    | Volver a consultar los 2 libros (deben reportarse como inexistentes)| 2.d                          |

---

## 🎲 Manejo de datos dinámicos

**Evidencia del requerimiento "Evidencia del manejo de datos dinámicos":**

El módulo [`src/utils/dataGenerator.ts`](src/utils/dataGenerator.ts) implementa:

- **`generateUniqueIsbnAisle()`** → combina `crypto.randomUUID()` con un timestamp para
  producir en cada ejecución un `isbn` y un `aisle` **únicos**. Esto evita colisiones
  del `ID` resultante (`isbn + aisle`) en el backend, aun bajo ejecuciones concurrentes.
- **`buildBookPayload(overrides)`** → fabrica un payload válido para `POST /Addbook.php`
  totalmente dinámico, pero admite `overrides` tipados para forzar casos negativos (p.ej.
  `aisle` con letras para disparar el 500 del punto 1.e).
- **`expectedBookId(payload)`** → derivar el ID esperado desde el payload, para la
  verificación del punto 1.d sin depender de respuestas previas.

Beneficios:

- Cada corrida es independiente y repetible.
- Si corre en paralelo o varios developers ejecutan al mismo tiempo, no hay colisión.
- La fase `iii` (DELETE) del flujo CRUD limpia por sí misma, pero las suites funcionales
  también eliminan en `afterAll` los libros que crearon para no dejar basura.

---

## 🏗️ Decisiones de diseño

### 1. Playwright API testing sin navegador

La suite usa `APIRequestContext` de Playwright - **no instala navegadores** y es tan
rápida como un cliente HTTP puro, pero con el runner, reportes y trazas que ya conoce
el equipo.

### 2. Zod para validar contratos

En lugar de aserciones ad-hoc (`expect(body).toHaveProperty('Msg')` + `typeof`), cada
respuesta se valida contra un **esquema Zod** declarativo. Esto:

- Verifica keys **y** tipos en una sola línea.
- Produce mensajes de error ricos indicando exactamente qué campo falló.
- Centraliza el contrato: si el servicio cambia, se modifica un sólo archivo
  (`src/schemas/bookSchemas.ts`).

### 3. Fixture Playwright

El fixture `bookApi` ([`src/fixtures/apiFixture.ts`](src/fixtures/apiFixture.ts))
inyecta un `BookApi` ya configurado en cada test. Ventajas:

- No se repite instanciación en cada archivo.
- Se asegura `dispose()` del contexto al final de cada test → sin leaks.
- Los tests sólo declaran lo que usan.

### 4. Medición de tiempos del lado del cliente

El cliente `BookApi` captura `Date.now()` antes y después de cada request. Esto refleja
la **experiencia real del consumidor**, no una métrica interna del servidor.

### 5. Aserciones encapsuladas

[`src/utils/assertions.ts`](src/utils/assertions.ts) centraliza las verificaciones
repetitivas (`assertStatus`, `assertResponseTime`, `assertSchema`). Si queremos cambiar
cómo se reporta un fallo, se modifica en un sólo lugar.

### 6. Tests negativos robustos

Los puntos 2.d y 3.d usan un `NON_EXISTENT_ID` configurable para que, si en el futuro un
ID "al azar" colisiona con uno real, baste cambiar la variable de entorno.

### 7. CRUD en modo `describe.serial`

El flujo CRUD depende del orden (crear → consultar → eliminar → consultar). Se declara
`test.describe.serial(...)` para que Playwright respete el orden y detenga la suite al
primer fallo, evitando falsos positivos en pasos subsiguientes.

---

## 📜 Licencia

MIT
