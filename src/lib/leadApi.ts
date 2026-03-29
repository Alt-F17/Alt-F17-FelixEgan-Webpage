import { getStoredUtm } from "@/lib/utm";
import type { LeadRequest, LeadResponse, LeadType, LocaleCode } from "@/types/lead";

type LeadInput = Omit<LeadRequest, "utm" | "leadType" | "locale">;

const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lead-intake`;

export const submitLead = async (
  leadType: LeadType,
  locale: LocaleCode,
  input: LeadInput,
): Promise<LeadResponse> => {
  const payload: LeadRequest = {
    ...input,
    leadType,
    locale,
    utm: getStoredUtm(),
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Lead submission failed: ${response.status}`);
  }

  return (await response.json()) as LeadResponse;
};
