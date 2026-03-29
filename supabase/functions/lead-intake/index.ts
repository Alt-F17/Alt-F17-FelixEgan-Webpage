import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const leadSchema = z.object({
  leadType: z.enum(["discovery_call", "quote", "testimonial"]),
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(320),
  company: z.string().min(1).max(160),
  phone: z.string().nullable(),
  preferredContact: z.enum(["email", "phone"]),
  websiteUrl: z.string().nullable(),
  budgetRange: z.enum(["under_2k", "2k_5k", "5k_10k", "10k_plus", "unknown"]),
  timeline: z.enum(["asap", "1_month", "2_3_months", "flexible"]),
  services: z.array(z.enum(["website-redesign", "seo", "maintenance"])).default([]),
  message: z.string().min(5).max(4000),
  locale: z.enum(["en", "fr"]),
  utm: z.object({
    source: z.string().nullable(),
    medium: z.string().nullable(),
    campaign: z.string().nullable(),
  }),
  honeypot: z.string().optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sha256 = async (input: string) => {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRole) {
      return json({ error: "Missing Supabase configuration" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRole);
    const rawBody = await request.json();
    const parsed = leadSchema.safeParse(rawBody);

    if (!parsed.success) {
      return json({ error: "Invalid payload", details: parsed.error.flatten() }, 400);
    }

    const payload = parsed.data;
    if (payload.honeypot && payload.honeypot.trim().length > 0) {
      return json({ error: "Invalid submission" }, 400);
    }

    const forwarded = request.headers.get("x-forwarded-for") ?? "";
    const ip = forwarded.split(",")[0]?.trim() || "unknown";
    const ipHash = await sha256(ip);

    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { data: recentEntries, error: rateReadError } = await supabase
      .from("lead_rate_limits")
      .select("ip_hash")
      .eq("ip_hash", ipHash)
      .gte("created_at", oneMinuteAgo);

    if (rateReadError) {
      return json({ error: "Rate limit lookup failed" }, 500);
    }

    if (recentEntries && recentEntries.length > 0) {
      return json({ error: "Too many requests" }, 429);
    }

    await supabase.from("lead_rate_limits").upsert({ ip_hash: ipHash, created_at: new Date().toISOString() });

    const { data: insertedLead, error: insertError } = await supabase
      .from("leads")
      .insert({
        lead_type: payload.leadType,
        full_name: payload.fullName,
        email: payload.email,
        company: payload.company,
        phone: payload.phone,
        preferred_contact: payload.preferredContact,
        website_url: payload.websiteUrl,
        budget_range: payload.budgetRange,
        timeline: payload.timeline,
        services: payload.services,
        message: payload.message,
        locale: payload.locale,
        utm_source: payload.utm.source,
        utm_medium: payload.utm.medium,
        utm_campaign: payload.utm.campaign,
        status: "new",
        ip_hash: ipHash,
      })
      .select("id")
      .single();

    if (insertError || !insertedLead) {
      return json({ error: "Insert failed" }, 500);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const alertTo = Deno.env.get("LEAD_ALERT_TO");
    const alertFrom = Deno.env.get("LEAD_ALERT_FROM") ?? "Leads <onboarding@resend.dev>";
    if (resendKey && alertTo) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: alertFrom,
          to: [alertTo],
          subject: `New ${payload.leadType} lead: ${payload.company}`,
          text: [
            `Lead ID: ${insertedLead.id}`,
            `Name: ${payload.fullName}`,
            `Email: ${payload.email}`,
            `Company: ${payload.company}`,
            `Phone: ${payload.phone ?? "-"}`,
            `Preferred: ${payload.preferredContact}`,
            `Budget: ${payload.budgetRange}`,
            `Timeline: ${payload.timeline}`,
            `Services: ${payload.services.join(", ")}`,
            `Locale: ${payload.locale}`,
            `UTM: ${payload.utm.source ?? "-"} / ${payload.utm.medium ?? "-"} / ${payload.utm.campaign ?? "-"}`,
            "",
            payload.message,
          ].join("\n"),
        }),
      });
    }

    return json({ success: true, leadId: insertedLead.id });
  } catch (error) {
    return json({ error: "Unexpected error", detail: String(error) }, 500);
  }
});
