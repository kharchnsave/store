const BASE = "http://internal.invalid";

export const ADMIN_HOME = "/admin";
export const ADMIN_LOGIN = "/admin/login";

/**
 * Where to send someone after signing in. Only paths inside the admin area
 * are allowed (never another site, a protocol-relative URL such as
 * "//evil.example", a backslash trick, or the login page itself); anything
 * else falls back to the admin home page.
 */
export function safeAdminPath(value: unknown): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) return ADMIN_HOME;
  // Must be a plain absolute path: no scheme, no "//host", no "\", no control characters.
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) {
    return ADMIN_HOME;
  }

  let url: URL;
  try {
    url = new URL(value, BASE);
  } catch {
    return ADMIN_HOME;
  }
  if (url.origin !== BASE) return ADMIN_HOME;

  const path = url.pathname;
  const inAdmin = path === ADMIN_HOME || path.startsWith(`${ADMIN_HOME}/`);
  const isLogin = path === ADMIN_LOGIN || path.startsWith(`${ADMIN_LOGIN}/`);
  if (!inAdmin || isLogin) return ADMIN_HOME;

  return `${path}${url.search}${url.hash}`;
}
