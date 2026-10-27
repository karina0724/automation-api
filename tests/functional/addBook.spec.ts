import { test, expect } from '../../src/fixtures/apiFixture.js';
import {
  buildBookPayload,
  expectedBookId,
} from '../../src/utils/dataGenerator.js';
import { addBookSuccessSchema } from '../../src/schemas/bookSchemas.js';
import {
  assertResponseTime,
  assertSchema,
  assertStatus,
} from '../../src/utils/assertions.js';

/**
 * Functional suite - POST /Addbook.php
 *
 * Covers points 1.a - 1.e of Challenge #3:
 *   a. 200 OK status code
 *   b. JSON structure (keys and types)
 *   c. Time < 500 ms
 *   d. ID = isbn + aisle
 *   e. Sending a non-numeric aisle -> 500
 */
test.describe('AddBook /Addbook.php - Pruebas funcionales', () => {
  const createdIds: string[] = [];

  // Cleanup: deletes everything created at the end, to avoid leftover data
  test.afterAll(async ({ bookApi }) => {
    for (const id of createdIds) {
      await bookApi.deleteBook({ ID: id }).catch(() => {
        /* cleanup failures are ignored */
      });
    }
  });

  test('1.a - debe responder 200 OK al agregar un libro válido', async ({
    bookApi,
  }) => {
    const payload = buildBookPayload();
    const result = await bookApi.addBook(payload);

    assertStatus(result, 200);
    // Track the ID for later cleanup
    createdIds.push(expectedBookId(payload));
  });

  test('1.b - debe cumplir el contrato JSON (keys Msg/ID y tipos string)', async ({
    bookApi,
  }) => {
    const payload = buildBookPayload();
    const result = await bookApi.addBook(payload);

    assertStatus(result, 200);
    const parsed = assertSchema(result, addBookSuccessSchema);

    expect(parsed.Msg).toBe('successfully added');
    expect(typeof parsed.ID).toBe('string');
    expect(parsed.ID.length).toBeGreaterThan(0);

    createdIds.push(parsed.ID);
  });

  test('1.c - debe responder en menos de 500 ms', async ({ bookApi }) => {
    const payload = buildBookPayload();
    const result = await bookApi.addBook(payload);

    assertStatus(result, 200);
    assertResponseTime(result);

    createdIds.push(expectedBookId(payload));
  });

  test('1.d - el ID devuelto debe ser isbn + aisle concatenados', async ({
    bookApi,
  }) => {
    const payload = buildBookPayload();
    const result = await bookApi.addBook(payload);

    assertStatus(result, 200);
    const parsed = assertSchema(result, addBookSuccessSchema);

    const esperado = expectedBookId(payload);
    expect(
      parsed.ID,
      `El ID devuelto (${parsed.ID}) debería ser la concatenación de isbn (${payload.isbn}) + aisle (${payload.aisle})`,
    ).toBe(esperado);

    createdIds.push(parsed.ID);
  });

  test('1.e - debe responder 500 cuando aisle contiene letras (no numérico)', async ({
    bookApi,
  }) => {
    const payload = buildBookPayload({ aisle: 'ABC_no_numero' });
    const result = await bookApi.addBook(payload);

    // Swagger documents a 500 with empty body for a non-numeric aisle.
    expect(
      result.response.status(),
      'Enviando aisle no numérico, se espera código 500',
    ).toBe(500);
  });
});
