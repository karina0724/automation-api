import { z } from 'zod';

/**
 * Zod schemas that model the Library service contracts.
 *
 * Validating with `.parse()`/`.safeParse()` checks both key names
 * and the type of the returned values, fulfilling the
 * requirement of Challenge #3 (point b in each endpoint).
 */

// -------- POST /Addbook.php - 200 OK response --------
export const addBookSuccessSchema = z
  .object({
    Msg: z.string(),
    ID: z.string(),
  })
  .strict();

export type AddBookSuccess = z.infer<typeof addBookSuccessSchema>;

// -------- GET /GetBook.php - 200 OK response (array with 1 item) --------
export const getBookItemSchema = z
  .object({
    book_name: z.string(),
    isbn: z.string(),
    aisle: z.string(),
    author: z.string(),
  })
  .strict();

export const getBookSuccessSchema = z.array(getBookItemSchema).min(1);

export type GetBookItem = z.infer<typeof getBookItemSchema>;

// -------- GET /GetBook.php - 404 Book not found response --------
export const getBookNotFoundSchema = z
  .object({
    msg: z.string(),
  })
  .strict();

// -------- POST /DeleteBook.php - 200 OK response --------
export const deleteBookSuccessSchema = z
  .object({
    msg: z.string(),
  })
  .strict();

// -------- POST /DeleteBook.php - 404 Book not found response --------
export const deleteBookNotFoundSchema = z
  .object({
    msg: z.string(),
  })
  .strict();
