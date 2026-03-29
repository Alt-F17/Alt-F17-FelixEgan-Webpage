export type LeadType = "discovery_call" | "quote" | "testimonial";
export type BudgetRange =
  | "under_2k"
  | "2k_5k"
  | "5k_10k"
  | "10k_plus"
  | "unknown";
export type TimelineOption = "asap" | "1_month" | "2_3_months" | "flexible";
export type LocaleCode = "en" | "fr";
export type PreferredContact = "email" | "phone";
export type ServiceOption = "website-redesign" | "seo" | "maintenance";

export type LeadUtm = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
};

export type LeadRequest = {
  leadType: LeadType;
  fullName: string;
  email: string;
  company: string;
  phone: string | null;
  preferredContact: PreferredContact;
  websiteUrl: string | null;
  budgetRange: BudgetRange;
  timeline: TimelineOption;
  services: ServiceOption[];
  message: string;
  locale: LocaleCode;
  utm: LeadUtm;
  honeypot?: string;
};

export type LeadResponse = {
  success: boolean;
  leadId: string;
};
