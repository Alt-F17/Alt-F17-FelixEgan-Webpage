import type { LeadUtm } from "@/types/lead";

const UTM_STORAGE_KEY = "lead_utm";

export const captureUtmFromLocation = () => {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const utm: LeadUtm = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
  };

  const hasAny = utm.source || utm.medium || utm.campaign;
  if (hasAny) {
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
  }
};

export const getStoredUtm = (): LeadUtm => {
  if (typeof window === "undefined") {
    return { source: null, medium: null, campaign: null };
  }

  const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
  if (!raw) {
    return { source: null, medium: null, campaign: null };
  }

  try {
    const parsed = JSON.parse(raw) as LeadUtm;
    return {
      source: parsed.source ?? null,
      medium: parsed.medium ?? null,
      campaign: parsed.campaign ?? null,
    };
  } catch {
    return { source: null, medium: null, campaign: null };
  }
};
