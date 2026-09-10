import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCountdownUntil } from "@/lib/countdown";

export type RetryCountdownProps = {
  /** Human-readable error message from the relay's standard error body. */
  message: string;
  /**
   * ISO timestamp the caller may retry at, or null when the relay has no
   * known retry time yet (e.g. a quota/IP-cap block whose only blocking
   * item is still `pending_scan`, per Workstream D's contract). When null,
   * show a static message rather than fabricate a countdown.
   */
  retryAt: string | null;
};

/**
 * Renders the backend's standard `{message, retryAt}` error shape via the
 * existing Alert primitive, styled to match the page's pre-existing
 * hand-rolled amber banner (`border-amber-900/60 bg-amber-950/40
 * text-amber-400`) instead of Alert's default destructive theme tokens.
 */
export function RetryCountdown({ message, retryAt }: RetryCountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!retryAt) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [retryAt]);

  const msRemaining = retryAt ? new Date(retryAt).getTime() - now : 0;
  const canRetry = retryAt !== null && msRemaining <= 0;

  return (
    <Alert className="border-amber-900/60 bg-amber-950/40 text-amber-400 [&>svg]:text-amber-400">
      <AlertTitle className="text-amber-300">
        {retryAt === null ? "Try again shortly" : canRetry ? "You can try again now" : "Try again soon"}
      </AlertTitle>
      <AlertDescription className="text-amber-400/90">
        {message}
        {retryAt !== null && !canRetry && (
          <span className="ml-1.5 font-mono tabular-nums text-amber-300">
            ({formatCountdownUntil(retryAt, now)})
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}
