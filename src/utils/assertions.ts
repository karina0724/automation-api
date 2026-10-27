import { expect } from '@playwright/test';
import type { z } from 'zod';
import type { TimedResponse } from '../api/bookApi.js';
import { config } from '../api/config.js';

/**
 * Reusable assertions.
 *
 * Encapsulating common checks (HTTP status, max time, Zod contract)
 * avoids repeating them in each test and keeps error messages uniform.
 */

/**
 * Validates that the status code matches the expected one.
 * We use `expect.soft` where non-blocking to accumulate failures.
 */
export function assertStatus(
  { response }: TimedResponse,
  expected: number,
): void {
  expect(
    response.status(),
    `Se esperaba HTTP ${expected} pero se obtuvo ${response.status()}`,
  ).toBe(expected);
}

/**
 * Validates that the response completes below the threshold (default 500 ms).
 */
export function assertResponseTime(
  { elapsedMs }: TimedResponse,
  maxMs: number = config.maxResponseTimeMs,
): void {
  expect(
    elapsedMs,
    `La respuesta tardó ${elapsedMs} ms, excediendo el límite de ${maxMs} ms`,
  ).toBeLessThanOrEqual(maxMs);
}

/**
 * Validates the JSON structure against a Zod schema.
 * If it fails, prints the detail of Zod issues.
 */
export function assertSchema<T>(
  { body }: TimedResponse,
  schema: z.ZodType<T>,
): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(
      `El cuerpo de la respuesta no cumple el contrato esperado.\n` +
        `Issues:\n${JSON.stringify(result.error.issues, null, 2)}\n` +
        `Body recibido:\n${JSON.stringify(body, null, 2)}`,
    );
  }
  return result.data;
}
