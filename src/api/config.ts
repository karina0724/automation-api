/**
 * Centralized configuration - values with fallbacks for local testing.
 * Environment variables (see .env.template) allow overriding these defaults.
 */
export const config = {
  baseURL: process.env.BASE_URL ?? 'https://rahulshettyacademy.com/Library/',
  maxResponseTimeMs: Number(process.env.MAX_RESPONSE_TIME_MS ?? 500),
  nonExistentId: process.env.NON_EXISTENT_ID ?? 'NO_EXISTE_000000000',
  endpoints: {
    addBook: 'Addbook.php',
    getBook: 'GetBook.php',
    deleteBook: 'DeleteBook.php',
  } as const,
} as const;

export type AppConfig = typeof config;
