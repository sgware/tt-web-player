/**
 * Per the Tandem Tales Web Client Requirements, the values for the client's
 * name, the world, and the partner may only consist of upper/lower case
 * letters, digits, and underscores, with a max length of 20.
 */
const TOKEN_PATTERN = /^[A-Za-z0-9_]{0,20}$/;

export function isValidToken(value: string): boolean {
  return TOKEN_PATTERN.test(value);
}
