import { getStoredUtm } from "@/lib/utm";
import type { LeadRequest, LeadResponse, LeadType, LocaleCode } from "@/types/lead";

type LeadInput = Omit<LeadRequest, "utm" | "leadType" | "locale">;

const supabaseEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lead-intake`;
const discoveryCallEndpoint = "/api/discovery-call";

export const submitLead = async (
  leadType: LeadType,
  locale: LocaleCode,
  input: LeadInput,
): Promise<LeadResponse> => {
  const payload: LeadRequest = {
    ...input,
    company: input.company.trim() || "Individual",
    leadType,
    locale,
    utm: getStoredUtm(),
  };

  const endpoint = leadType === "discovery_call" ? discoveryCallEndpoint : supabaseEndpoint;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (leadType !== "discovery_call") {
    headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Lead submission failed: ${response.status}`);
  }

  return (await response.json()) as LeadResponse;
};
