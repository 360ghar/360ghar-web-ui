/**
 * Test fixtures for API types. A test names only the fields its code reads, and the rest is
 * left out on purpose. Tests only: nothing in the app imports this file.
 */
export const partial = <T extends object>(fields: Partial<T>): T => fields as T;
