import { z } from "zod";

const leadSchema = z.object({
  leadType: z.literal("discovery_call"),
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(180).default("Individual"),
  phone: z.string().trim().max(80).nullable().optional(),
  preferredContact: z.enum(["email", "phone"]),
  websiteUrl: z.string().trim().max(500).nullable().optional(),
  budgetRange: z.enum(["under_2k", "2k_5k", "5k_10k", "10k_plus", "unknown"]),
  timeline: z.enum(["asap", "1_month", "2_3_months", "flexible"]),
  services: z.array(z.enum(["website-redesign", "seo", "maintenance"])).max(8),
  message: z.string().trim().min(8).max(4000),
  locale: z.enum(["en", "fr"]),
  utm: z
    .object({
      source: z.string().trim().max(120).nullable(),
      medium: z.string().trim().max(120).nullable(),
      campaign: z.string().trim().max(120).nullable(),
    })
    .default({ source: null, medium: null, campaign: null }),
  honeypot: z.string().optional(),
});

type LeadPayload = z.infer<typeof leadSchema>;

type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: {
    remoteAddress?: string;
  };
};

type VercelResponse = {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const TWENTY_REQUEST_TIMEOUT_MS = 5000;
const DEFAULT_TWENTY_INTAKE_URL = "https://theta.wampus-tyrannosaurus.ts.net/felix-discovery";
const rateLimitBuckets = new Map<string, number[]>();

const compact = <T extends Record<string, unknown>>(input: T) =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== null && value !== undefined && value !== ""),
  );

const getHeader = (request: VercelRequest, name: string) => {
  const value = request.headers[name] ?? request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

const getClientIp = (request: VercelRequest) => {
  const forwardedFor = getHeader(request, "x-forwarded-for");
  const realIp = getHeader(request, "x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp || request.socket?.remoteAddress || "unknown";
};

const parseRequestBody = (body: unknown) => {
  if (typeof body !== "string") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
};

const isRateLimited = (clientIp: string) => {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(clientIp)?.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS) ?? [];

  if (bucket.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitBuckets.set(clientIp, bucket);
    return true;
  }

  bucket.push(now);
  rateLimitBuckets.set(clientIp, bucket);
  return false;
};

const getRequiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing server environment variable: ${name}`);
  }

  return value;
};

const twentyRequest = async <T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    query?: URLSearchParams;
    body?: Record<string, unknown>;
  } = {},
): Promise<T> => {
  const baseUrl = (process.env.TWENTY_INTAKE_BASE_URL ?? DEFAULT_TWENTY_INTAKE_URL).replace(/\/$/, "");
  const apiKey = getRequiredEnv("TWENTY_API_KEY");
  const query = options.query?.toString();
  const url = `${baseUrl}${path}${query ? `?${query}` : ""}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TWENTY_REQUEST_TIMEOUT_MS);

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`TwentyCRM request failed: ${response.status} ${text}`);
  }

  return json as T;
};

const firstRecord = <T>(response: unknown, collectionName: string, createName?: string): T | null => {
  if (!response || typeof response !== "object") return null;

  const data = (response as { data?: Record<string, unknown> }).data;
  if (!data) return null;

  if (createName && data[createName]) {
    return data[createName] as T;
  }

  const collection = data[collectionName];
  if (Array.isArray(collection)) {
    return (collection[0] as T | undefined) ?? null;
  }

  return null;
};

const collectionRecords = <T>(response: unknown, collectionName: string): T[] => {
  if (!response || typeof response !== "object") return [];

  const data = (response as { data?: Record<string, unknown> }).data;
  const collection = data?.[collectionName];

  return Array.isArray(collection) ? (collection as T[]) : [];
};

const normalizePhone = (raw: string): string => {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.startsWith("+") ? `+${digits}` : `+${digits}`;
};

const splitName = (fullName: string) => {
  const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/);
  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
};

const findCompanyByName = async (name: string) => {
  const normalizedName = name.trim().toLowerCase();
  const query = new URLSearchParams({ limit: "100" });
  const response = await twentyRequest("/rest/companies", { query });
  return (
    collectionRecords<{ id: string; name?: string }>(response, "companies").find(
      (company) => company.name?.trim().toLowerCase() === normalizedName,
    ) ?? null
  );
};

const findPersonByEmail = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const query = new URLSearchParams({ limit: "100" });
  const response = await twentyRequest("/rest/people", { query });
  return (
    collectionRecords<{
      id: string;
      emails?: { primaryEmail?: string };
      emailsPrimaryEmail?: string;
    }>(response, "people").find((person) => {
      const primaryEmail = person.emails?.primaryEmail ?? person.emailsPrimaryEmail;
      return primaryEmail?.trim().toLowerCase() === normalizedEmail;
    }) ?? null
  );
};

const createCompany = async (payload: LeadPayload) => {
  const name = payload.company.trim() || "Individual";

  if (name === "Individual") {
    return null;
  }

  const existingCompany = await findCompanyByName(name);
  if (existingCompany) {
    return existingCompany;
  }

  const response = await twentyRequest("/rest/companies", {
    method: "POST",
    body: {
      name,
    },
  });

  return firstRecord<{ id: string }>(response, "companies", "createCompany");
};

const createPerson = async (payload: LeadPayload, companyId?: string | null) => {
  const existingPerson = await findPersonByEmail(payload.email);
  if (existingPerson) {
    return existingPerson;
  }

  const { firstName, lastName } = splitName(payload.fullName);
  const response = await twentyRequest("/rest/people", {
    method: "POST",
    body: compact({
      name: {
        firstName,
        lastName,
      },
      emails: {
        primaryEmail: payload.email,
        additionalEmails: [],
      },
      phones: payload.phone
        ? {
            primaryPhoneNumber: normalizePhone(payload.phone),
            primaryPhoneCountryCode: "",
            primaryPhoneCallingCode: "+1",
            additionalPhones: [],
          }
        : undefined,
      companyId,
    }),
  });

  return firstRecord<{ id: string }>(response, "people", "createPerson");
};

const createOpportunity = async (
  payload: LeadPayload,
  personId?: string | null,
  companyId?: string | null,
) => {
  const accountName = payload.company === "Individual" ? payload.fullName : payload.company;
  const response = await twentyRequest("/rest/opportunities", {
    method: "POST",
    body: compact({
      name: `Discovery call - ${accountName}`,
      companyId,
      pointOfContactId: personId,
    }),
  });

  return firstRecord<{ id: string }>(response, "opportunities", "createOpportunity");
};

const buildLeadNote = (payload: LeadPayload) =>
  [
    `Discovery call request from felixegan.me/studio`,
    "",
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Company: ${payload.company}`,
    `Phone: ${payload.phone || "-"}`,
    `Preferred contact: ${payload.preferredContact}`,
    `Current website: ${payload.websiteUrl || "-"}`,
    `Budget: ${payload.budgetRange}`,
    `Timeline: ${payload.timeline}`,
    `Services: ${payload.services.join(", ") || "-"}`,
    `Locale: ${payload.locale}`,
    `UTM: ${payload.utm.source || "-"} / ${payload.utm.medium || "-"} / ${payload.utm.campaign || "-"}`,
    "",
    payload.message,
  ].join("\n");

const createLeadNote = async (payload: LeadPayload, opportunityId?: string | null) => {
  try {
    const noteResponse = await twentyRequest("/rest/notes", {
      method: "POST",
      body: {
        title: `Discovery call - ${payload.fullName}`,
        bodyV2: {
          markdown: buildLeadNote(payload),
          blocknote: "",
        },
      },
    });
    const note = firstRecord<{ id: string }>(noteResponse, "notes", "createNote");

    if (note?.id && opportunityId) {
      await twentyRequest("/rest/noteTargets", {
        method: "POST",
        body: {
          noteId: note.id,
          targetOpportunityId: opportunityId,
        },
      });
    }
  } catch (error) {
    console.error("TwentyCRM note creation failed", error);
  }
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Discovery-Api-Version", "standard-intake-v2");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    response.status(429).json({ error: "Too many requests" });
    return;
  }

  const parsed = leadSchema.safeParse(parseRequestBody(request.body));
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid request" });
    return;
  }

  const payload = {
    ...parsed.data,
    company: parsed.data.company.trim() || "Individual",
  };

  if (payload.honeypot) {
    response.status(200).json({ success: true, leadId: "accepted" });
    return;
  }

  try {
    const company = await createCompany(payload);
    const person = await createPerson(payload, company?.id);
    const opportunity = await createOpportunity(payload, person?.id, company?.id);

    await createLeadNote(payload, opportunity?.id);

    response.status(200).json({ success: true, leadId: opportunity?.id ?? person?.id ?? "accepted" });
  } catch (error) {
    console.error("Discovery call submission failed", error);
    const message = error instanceof Error ? error.message : String(error);
    const code = message.includes("Missing server environment variable")
      ? "crm_configuration_missing"
      : message.includes("aborted")
        ? "crm_timeout"
        : "crm_submission_failed";

    response.status(502).json({ error: code });
  }
}
