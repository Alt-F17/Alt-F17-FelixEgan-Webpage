// Client for paste-relay's pattern-based auth (Workstream B's authRouter on
// the Theta relay). Identity here is "does this pattern's hash match any
// account" — there is no username, and there is intentionally NO
// self-service signup route: accounts only ever come from a one-time invite
// link Felix issues from the admin dashboard (?invite=<token> on /paste).

const apiBase = (import.meta.env.VITE_PASTE_API_BASE ?? "").replace(/\/$/, "");

export class AuthApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public retryAt: string | null = null,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

type ErrorBody = { error?: string; message?: string; retryAt?: string | null };

const parseErrorBody = async (response: Response): Promise<AuthApiError> => {
  const raw = await response.text().catch(() => "");
  let parsed: ErrorBody = {};
  try {
    parsed = raw ? (JSON.parse(raw) as ErrorBody) : {};
  } catch {
    // Non-JSON error body (e.g. a proxy/5xx HTML page) — fall back to raw text.
  }
  return new AuthApiError(
    parsed.message || raw || `Request failed: ${response.status}`,
    response.status,
    parsed.error,
    parsed.retryAt ?? null,
  );
};

const authFetch = async (path: string, body?: unknown, token?: string): Promise<Response> => {
  if (!apiBase) throw new AuthApiError("Paste relay is not configured (VITE_PASTE_API_BASE)");
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw await parseErrorBody(response);
  return response;
};

// Hashes the drawn pattern client-side (Web Crypto, no library) so the raw
// cell sequence never leaves the browser — the server only ever receives
// this digest, then salts + scrypts it again server-side before storage or
// comparison. Because the server never sees the raw cells, it also can't
// verify how many were drawn; the ≥5-cell minimum is enforced purely
// client-side in PatternGrid.tsx (see the comment there).
export const hashPatternClient = async (cells: number[]): Promise<string> => {
  const bytes = new TextEncoder().encode(cells.join(","));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export type AuthResponse = { token: string; expiresAt: string };

/** POST /api/auth/redeem-invite — one-time invite redemption, sets up a new account. */
export const redeemInvite = async (
  inviteToken: string,
  patternHashClient: string,
  turnstileToken: string,
): Promise<AuthResponse> => {
  const response = await authFetch("/api/auth/redeem-invite", { inviteToken, patternHashClient, turnstileToken });
  return (await response.json()) as AuthResponse;
};

/** POST /api/auth/login — 5/min per-IP rate limit + mandatory Turnstile on the server. */
export const login = async (patternHashClient: string, turnstileToken: string): Promise<AuthResponse> => {
  const response = await authFetch("/api/auth/login", { patternHashClient, turnstileToken });
  return (await response.json()) as AuthResponse;
};

/** POST /api/auth/logout — revokes the current session. */
export const logout = async (token: string): Promise<void> => {
  await authFetch("/api/auth/logout", undefined, token);
};

// --- Session storage (localStorage-backed) ----------------------------------

export type Session = { token: string; expiresAt: string };

const SESSION_STORAGE_KEY = "paste:session";

export const saveSession = (session: Session): void => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage may be unavailable (private browsing, quota exceeded) — the
    // session just won't survive a reload; in-memory state still works.
  }
};

/** Returns the stored session, or null if absent/malformed/expired-per-`expiresAt`. */
export const loadSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.token || !parsed.expiresAt) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      clearSession();
      return null;
    }
    return { token: parsed.token, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore — nothing to clean up if storage isn't available.
  }
};
