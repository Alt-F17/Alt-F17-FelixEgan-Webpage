// Thin wrapper around Cloudflare Turnstile's explicit-render JS API (loaded
// lazily, no npm dependency) — mirrors the old googleAuth.ts's shape
// (lazy <script> injection, a Promise-based loader) since that's this
// codebase's established pattern for third-party auth-adjacent widgets.
//
// API surface confirmed against Cloudflare's docs
// (https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/):
// `turnstile.render(container, params) => widgetId`, `turnstile.reset(widgetId)`,
// `turnstile.remove(widgetId)`.

type TurnstileRenderParams = {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: (errorCode?: string) => void;
  "expired-callback"?: () => void;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "flexible" | "compact";
};

type TurnstileApi = {
  render: (container: string | HTMLElement, params: TurnstileRenderParams) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
  getResponse: (widgetId?: string) => string | undefined;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

/** Lazy-injects the Turnstile script exactly once, resolving once `window.turnstile` is ready. */
export const loadTurnstileScript = (): Promise<void> => {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Cloudflare Turnstile"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export type TurnstileHandle = {
  /** Clears the current solve and re-challenges the visitor — use before each new submit. */
  reset: () => void;
  /** Tears down the widget and its DOM; call on unmount. */
  remove: () => void;
};

export type TurnstileCallbacks = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: (errorCode?: string) => void;
};

/**
 * Renders a Turnstile widget into `container`. Resolves once the widget is
 * mounted (not once solved — solving is async and reported via `onToken`).
 */
export const renderTurnstile = (
  container: HTMLElement,
  siteKey: string,
  { onToken, onExpire, onError }: TurnstileCallbacks,
): Promise<TurnstileHandle> => {
  return loadTurnstileScript().then(() => {
    if (!window.turnstile) throw new Error("Turnstile script loaded but window.turnstile is missing");
    if (!siteKey) throw new Error("Missing Turnstile site key");

    const widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      theme: "dark",
      callback: onToken,
      "expired-callback": onExpire,
      "error-callback": onError,
    });

    return {
      reset: () => window.turnstile?.reset(widgetId),
      remove: () => window.turnstile?.remove(widgetId),
    };
  });
};
