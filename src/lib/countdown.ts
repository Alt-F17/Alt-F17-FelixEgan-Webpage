// Hoisted out of PastePage.tsx so RetryCountdown (rate-limit/quota/captcha
// errors) and the paste-item TTL countdown can share the same M:SS formatter.

/** Formats a millisecond duration as `M:SS`, clamped at zero. */
export const formatCountdown = (msRemaining: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/** Formats the time remaining until `target` (Date or ISO string) as `M:SS`. */
export const formatCountdownUntil = (target: Date | string, now: number = Date.now()): string => {
  const targetMs = typeof target === "string" ? new Date(target).getTime() : target.getTime();
  return formatCountdown(targetMs - now);
};
