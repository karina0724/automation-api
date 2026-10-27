import { defineConfig } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

// Load environment variables from .env (if present)
loadEnv({ quiet: true });

/**
 * Playwright config - API Testing suite para https://rahulshettyacademy.com/Library
 *
 * Documentación: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  // Tiempo máximo por test
  timeout: 30_000,
  // Expectativas con timeout corto para contratos API (ms)
  expect: {
    timeout: 5_000,
  },
  // Falla si hay .only olvidado en CI
  forbidOnly: !!process.env.CI,
  // Retries limitados
  retries: process.env.CI ? 2 : 0,
  // Workers: en CI serial, en local paralelo
  workers: Number(process.env.WORKERS),
  // Reporteros - HTML + lista para consola + JSON para artefactos
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'always' }]
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://rahulshettyacademy.com/Library',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
    // Trazas útiles al fallar un test
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api-tests',
      testMatch: /.*\.spec\.ts/,
    },
  ],
});
