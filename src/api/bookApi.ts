import type { APIRequestContext, APIResponse } from '@playwright/test';
import { config } from './config.js';

/**
 * Payload to create a book via POST /Addbook.php
 */
export interface AddBookPayload {
  name: string;
  isbn: string;
  aisle: string;
  author: string;
}

/**
 * Payload to delete a book via POST /DeleteBook.php
 */
export interface DeleteBookPayload {
  ID: string;
}

/**
 * Enriched result of an HTTP call: includes raw response,
 * parsed body and client-side measured time.
 */
export interface TimedResponse<T = unknown> {
  response: APIResponse;
  body: T;
  elapsedMs: number;
}

/**
 * Typed client for the 3 endpoints of the Library service.
 *
 * Centralizes time measurement, JSON parsing and handling of
 * empty bodies (as happens in AddBook's 500 with a non-numeric `aisle`).
 */
export class BookApi {
  constructor(private readonly request: APIRequestContext) {}

  /**
   * POST /Addbook.php - Adds a book.
   */
  async addBook(payload: AddBookPayload): Promise<TimedResponse> {
    const start = performance.now();
    const response = await this.request.post(config.endpoints.addBook, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    });
    const elapsedMs = performance.now() - start;
    const body = await this.safeJson(response);
    return { response, body, elapsedMs };
  }

  /**
   * GET /GetBook.php?ID=<id> - Retrieves a book by its ID.
   */
  async getBook(id: string): Promise<TimedResponse> {
    const start = performance.now();
    const response = await this.request.get(config.endpoints.getBook, {
      params: { ID: id },
    });
    const elapsedMs = performance.now() - start;
    const body = await this.safeJson(response);
    return { response, body, elapsedMs };
  }

  /**
   * POST /DeleteBook.php - Deletes a book by its ID.
   */
  async deleteBook(payload: DeleteBookPayload): Promise<TimedResponse> {
    const start = performance.now();
    const response = await this.request.post(config.endpoints.deleteBook, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    });
    const elapsedMs = performance.now() - start;
    const body = await this.safeJson(response);
    return { response, body, elapsedMs };
  }

  /**
   * Parses the body as JSON, but returns `null` if the response is
   * empty or not valid JSON (needed, for example, for the 500 that
   * according to Swagger returns an empty body).
   */
  private async safeJson(response: APIResponse): Promise<unknown> {
    const text = await response.text();
    if (!text || text.trim().length === 0) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
