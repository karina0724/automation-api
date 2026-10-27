import { test, expect } from '../../src/fixtures/apiFixture.js';
import {
  buildBookPayload,
  expectedBookId,
} from '../../src/utils/dataGenerator.js';
import {
  deleteBookNotFoundSchema,
  deleteBookSuccessSchema,
} from '../../src/schemas/bookSchemas.js';
import {
  assertResponseTime,
  assertSchema,
  assertStatus,
} from '../../src/utils/assertions.js';
import { config } from '../../src/api/config.js';
import type { BookApi } from '../../src/api/bookApi.js';

/**
 * Functional suite - POST /DeleteBook.php
 *
 * Covers points 3.a - 3.d of Challenge #3:
 *   a. 200 OK status code
 *   b. JSON structure (keys and types)
 *   c. Time < 500 ms
 *   d. Deleting a non-existent book -> correct code and message
 */

/**
 * Helper: creates a fresh book and returns its ID.
 * Centralizes the "seed" to avoid coupling tests to each other.
 */
async function seedBook(bookApi: BookApi): Promise<string> {
  const payload = buildBookPayload();
  const result = await bookApi.addBook(payload);
  expect(result.response.status()).toBe(200);
  return expectedBookId(payload);
}

test.describe('DeleteBook /DeleteBook.php - Pruebas funcionales', () => {
  test('3.a - debe responder 200 OK al eliminar un libro existente', async ({
    bookApi,
  }) => {
    const id = await seedBook(bookApi);
    const result = await bookApi.deleteBook({ ID: id });
    assertStatus(result, 200);
  });

  test('3.b - debe cumplir el contrato JSON (key msg tipo string)', async ({
    bookApi,
  }) => {
    const id = await seedBook(bookApi);
    const result = await bookApi.deleteBook({ ID: id });

    assertStatus(result, 200);
    const parsed = assertSchema(result, deleteBookSuccessSchema);
    expect(parsed.msg).toBe('book is successfully deleted');
  });

  test('3.c - debe responder en menos de 500 ms', async ({ bookApi }) => {
    const id = await seedBook(bookApi);
    const result = await bookApi.deleteBook({ ID: id });
    assertStatus(result, 200);
    assertResponseTime(result);
  });

  test('3.d - debe devolver mensaje adecuado al eliminar un libro inexistente', async ({
    bookApi,
  }) => {
    const result = await bookApi.deleteBook({ ID: config.nonExistentId });

    // Swagger documents 404 for this case; we validate non-200 + error payload.
    expect(
      result.response.status(),
      'Eliminando un ID inexistente, se espera un código distinto de 200',
    ).not.toBe(200);

    const parsed = assertSchema(result, deleteBookNotFoundSchema);
    expect(parsed.msg).toContain('doesnt exists');
  });
});
