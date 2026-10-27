import { expect, test } from "../../src/fixtures/apiFixture.js";
import {
  buildBookPayload,
  expectedBookId,
} from "../../src/utils/dataGenerator.js";
import {
  getBookNotFoundSchema,
  getBookSuccessSchema,
} from "../../src/schemas/bookSchemas.js";
import {
  assertResponseTime,
  assertSchema,
  assertStatus,
} from "../../src/utils/assertions.js";
import { config } from "../../src/api/config.js";
import type { AddBookPayload } from "../../src/api/bookApi.js";

/**
 * Functional suite - GET /GetBook.php
 *
 * Covers points 2.a - 2.d of Challenge #3:
 *   a. 200 OK status code
 *   b. JSON structure (keys and types)
 *   c. Time < 500 ms
 *   d. Non-existent ID -> correct code and message
 */
test.describe("GetBook /GetBook.php - Pruebas funcionales", () => {
  let seedPayload: AddBookPayload;
  let seedId: string;

  // Seed: create a book at the start so it can be queried in the tests.
  test.beforeAll(async ({ bookApi }) => {
    seedPayload = buildBookPayload();
    const created = await bookApi.addBook(seedPayload);
    expect(created.response.status()).toBe(200);
    seedId = expectedBookId(seedPayload);
  });

  // Cleanup when the suite finishes
  test.afterAll(async ({ bookApi }) => {
    if (seedId) {
      await bookApi.deleteBook({ ID: seedId }).catch(() => {});
    }
  });

  test("2.a - debe responder 200 OK al consultar un libro existente", async ({bookApi,}) => {
    const result = await bookApi.getBook(seedId);
    assertStatus(result, 200);
  });

  test("2.b - debe cumplir el contrato JSON (array con book_name, isbn, aisle, author)", async ({bookApi,}) => {
    const result = await bookApi.getBook(seedId);
    assertStatus(result, 200);

    const parsed = assertSchema(result, getBookSuccessSchema);
    const [libro] = parsed;

    expect(libro.book_name).toBe(seedPayload.name);
    expect(libro.isbn).toBe(seedPayload.isbn);
    expect(libro.aisle).toBe(seedPayload.aisle);
    expect(libro.author).toBe(seedPayload.author);
  });

  test("2.c - debe responder en menos de 500 ms", async ({ bookApi }) => {
    const result = await bookApi.getBook(seedId);
    assertStatus(result, 200);
    assertResponseTime(result);
  });

  test("2.d - debe retornar mensaje de validación al consultar un ID inexistente", async ({bookApi,}) => {
    const result = await bookApi.getBook(config.nonExistentId);

    // The real service returns 404 per Swagger. We validate non-200 + error payload.
    expect(
      result.response.status(),
      "Consultando un ID inexistente, se espera un código distinto de 200",
    ).not.toBe(200);

    const parsed = assertSchema(result, getBookNotFoundSchema);
    expect(parsed.msg).toContain("does not exists");
  });
});
