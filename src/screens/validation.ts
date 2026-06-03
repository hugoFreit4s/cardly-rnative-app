const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidPassword(value: string): boolean {
  const len = value.length;
  return len >= PASSWORD_MIN && len <= PASSWORD_MAX;
}
