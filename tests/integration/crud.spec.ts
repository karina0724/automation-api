import { test, expect } from '../../src/fixtures/apiFixture.js';
import {
  buildBookPayload,
  expectedBookId,
} from '../../src/utils/dataGenerator.js';
import {
  addBookSuccessSchema,
  deleteBookSuccessSchema,
  getBookNotFoundSchema,
  getBookSuccessSchema,
} from '../../src/schemas/bookSchemas.js';
import {
  assertResponseTime,
  assertSchema,
  assertStatus,
} from '../../src/utils/assertions.js';
import type { AddBookPayload } from '../../src/api/bookApi.js';

/**
 * Integrated CRUD suite - Point 4 of Challenge #3
 *
 * Flow:
 *   i.   Create 2 books with dynamic data (no offensive terms),
 *        applying validations a/b/c/d of the AddBook endpoint.
 *   ii.  Query the 2 created books, applying validations a/b/c.
 *   iii. Delete the 2 created books, applying validations a/b/c.
 *   iv.  Query the 2 books again, applying validation 2.d
 *        (should return an error message indicating they don't exist).
 */
test.describe
  .serial('CRUD integrado - Flujo completo sobre los 3 endpoints', () => {
  // Two books with neutral, creative values - no offensive content
  const libros: AddBookPayload[] = [
    buildBookPayload({
      name: 'Introducción a Playwright con TypeScript',
      author: 'Marie Curie',
    }),
    buildBookPayload({
      name: 'Buenas prácticas de API Testing',
      author: 'Alan Turing',
    }),
  ];

  // Computed IDs (the service concatenates isbn + aisle)
  const idsEsperados = libros.map(expectedBookId);

  test('i - CREATE: debe crear ambos libros con validaciones a, b, c, d', async ({
    bookApi,
  }) => {
    for (const [idx, libro] of libros.entries()) {
      const result = await bookApi.addBook(libro);

      // a. 200 OK status code
      assertStatus(result, 200);
      // c. Time < 500 ms
      assertResponseTime(result);
      // b. JSON structure (keys and types)
      const parsed = assertSchema(result, addBookSuccessSchema);
      // d. ID = isbn + aisle
      expect(
        parsed.ID,
        `Libro #${idx + 1}: el ID devuelto debe ser isbn + aisle`,
      ).toBe(idsEsperados[idx]);
      expect(parsed.Msg).toBe('successfully added');
    }
  });

  test('ii - READ: debe consultar ambos libros con validaciones a, b, c', async ({
    bookApi,
  }) => {
    for (const [idx, libro] of libros.entries()) {
      const result = await bookApi.getBook(idsEsperados[idx]);

      // a. 200 OK
      assertStatus(result, 200);
      // c. Time < 500 ms
      assertResponseTime(result);
      // b. JSON structure (keys and types)
      const [parsed] = assertSchema(result, getBookSuccessSchema);
      expect(parsed.book_name).toBe(libro.name);
      expect(parsed.isbn).toBe(libro.isbn);
      expect(parsed.aisle).toBe(libro.aisle);
      expect(parsed.author).toBe(libro.author);
    }
  });

  test('iii - DELETE: debe eliminar ambos libros con validaciones a, b, c', async ({
    bookApi,
  }) => {
    for (const [idx] of libros.entries()) {
      const result = await bookApi.deleteBook({ ID: idsEsperados[idx] });

      // a. 200 OK
      assertStatus(result, 200);
      // c. Time < 500 ms
      assertResponseTime(result);
      // b. JSON structure (keys and types)
      const parsed = assertSchema(result, deleteBookSuccessSchema);
      expect(parsed.msg).toBe('book is successfully deleted');
    }
  });

  test('iv - READ post-DELETE: ambos libros deben reportarse como inexistentes (2.d)', async ({
    bookApi,
  }) => {
    for (const [idx] of libros.entries()) {
      const result = await bookApi.getBook(idsEsperados[idx]);

      expect(
        result.response.status(),
        `Libro #${idx + 1}: tras eliminación se espera un código distinto de 200`,
      ).not.toBe(200);

      const parsed = assertSchema(result, getBookNotFoundSchema);
      expect(parsed.msg).toContain('does not exists');
    }
  });
});
