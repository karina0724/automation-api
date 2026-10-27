import { test as base, request as pwRequest } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { BookApi } from '../api/bookApi.js';
import { config } from '../api/config.js';

/**
 * Playwright fixture that injects a preconfigured `BookApi` into each test.
 *
 * Benefits:
 *   - A single instantiation point for the HTTP client.
 *   - Automatic context disposal when the test finishes (clean teardown).
 *   - Tests only declare what they use: `async ({ bookApi }) => { ... }`.
 */
type Fixtures = {
  apiContext: APIRequestContext;
  bookApi: BookApi;
};

export const test = base.extend<Fixtures>({
  apiContext: async ({}, use) => {
    const ctx = await pwRequest.newContext({
      baseURL: config.baseURL,
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    await use(ctx);
    await ctx.dispose();
  },
  bookApi: async ({ apiContext }, use) => {
    await use(new BookApi(apiContext));
  },
});

export { expect } from '@playwright/test';
