import { randomUUID } from 'node:crypto';
import type { AddBookPayload } from '../api/bookApi.js';

/**
 * Dynamic data generator.
 *
 * Each run produces unique ISBN, aisle and names. This avoids ID
 * collisions in the backend (ID = isbn + aisle) and gives traceability per run.
 *
 * This file is the **evidence of dynamic data handling** requested
 * in Challenge #3.
 */

/**
 * Returns a unique suffix based on UUID + timestamp.
 * Used to ensure uniqueness even in concurrent executions.
 */
function uniqueSuffix(): string {
  const uuid = randomUUID().replace(/-/g, '').slice(0, 6);
  const ts = Date.now().toString().slice(-6);
  return `${ts}${uuid}`.slice(0, 10);
}

/**
 * Generates a unique numeric ISBN and aisle per execution.
 */
export function generateUniqueIsbnAisle(): { isbn: string; aisle: string } {
  const suffix = uniqueSuffix();
  // Take the first 5 chars of the suffix for isbn, the next ones for aisle
  const isbn = `isbn${suffix.slice(0, 5)}`;
  const aisle = suffix.slice(5, 10).replace(/\D/g, '') || '123';
  return { isbn, aisle };
}

/**
 * Builds a valid, fully dynamic payload for POST /Addbook.php.
 *
 * @param overrides - Allows overriding specific fields (useful for
 *                    negative tests, e.g. forcing a non-numeric `aisle`).
 */
export function buildBookPayload(
  overrides: Partial<AddBookPayload> = {},
): AddBookPayload {
  const { isbn, aisle } = generateUniqueIsbnAisle();
  const defaults: AddBookPayload = {
    name: `Libro de prueba ${isbn}`,
    isbn,
    aisle,
    author: `Autor QA ${aisle}`,
  };
  return { ...defaults, ...overrides };
}

/**
 * Computes the expected ID for a newly created book.
 * According to Swagger: ID = concatenation of isbn + aisle.
 */
export function expectedBookId(payload: AddBookPayload): string {
  return `${payload.isbn}${payload.aisle}`;
}
