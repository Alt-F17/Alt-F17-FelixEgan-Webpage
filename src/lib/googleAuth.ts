// Thin wrapper around Google Identity Services (loaded lazily, no npm dependency).
// We only need short-lived ID tokens to hand to the Theta relay as bearer auth —
// no server-side OAuth redirect flow lives in this app.

type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: { credential: string }) => void;
  auto_select?: boolean;
};

type GoogleAccountsId = {
  initialize: (config: GoogleIdConfiguration) => void;
  prompt: () => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
  disableAutoSelect: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let scriptPromise: Promise<void> | null = null;

const loadGsiScript = (): Promise<void> => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export type GoogleIdentity = {
  idToken: string;
  email: string | null;
};

const decodeIdTokenEmail = (idToken: string): string | null => {
  try {
    const payload = idToken.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.email === "string" ? decoded.email : null;
  } catch {
    return null;
  }
};

// Renders Google's own button into `container` and resolves the first time the
// user signs in. Callers get an ID token they can refresh by calling this again.
export const renderGoogleSignInButton = (
  container: HTMLElement,
  clientId: string,
): Promise<GoogleIdentity> => {
  return loadGsiScript().then(
    () =>
      new Promise<GoogleIdentity>((resolve, reject) => {
        if (!clientId) {
          reject(new Error("Missing Google OAuth client ID"));
          return;
        }

        window.google!.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          callback: (response) => {
            resolve({
              idToken: response.credential,
              email: decodeIdTokenEmail(response.credential),
            });
          },
        });

        window.google!.accounts.id.renderButton(container, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "signin_with",
        });
      }),
  );
};

export const promptGoogleReauth = (clientId: string): Promise<GoogleIdentity> => {
  return loadGsiScript().then(
    () =>
      new Promise<GoogleIdentity>((resolve, reject) => {
        if (!clientId) {
          reject(new Error("Missing Google OAuth client ID"));
          return;
        }

        window.google!.accounts.id.initialize({
          client_id: clientId,
          auto_select: true,
          callback: (response) => {
            resolve({
              idToken: response.credential,
              email: decodeIdTokenEmail(response.credential),
            });
          },
        });

        window.google!.accounts.id.prompt();
      }),
  );
};
