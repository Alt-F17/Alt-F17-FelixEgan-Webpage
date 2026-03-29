import { FormEvent, useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { submitLead } from "@/lib/leadApi";
import { trackEvent } from "@/lib/plausible";
import type {
  BudgetRange,
  LeadType,
  PreferredContact,
  ServiceOption,
  TimelineOption,
} from "@/types/lead";

type LeadFormProps = {
  leadType: LeadType;
  submitLabel?: string;
};

type FormState = {
  fullName: string;
  email: string;
  company: string;
  phone: string;
  preferredContact: PreferredContact;
  websiteUrl: string;
  budgetRange: BudgetRange;
  timeline: TimelineOption;
  services: ServiceOption[];
  message: string;
  honeypot: string;
};

const initialState: FormState = {
  fullName: "",
  email: "",
  company: "",
  phone: "",
  preferredContact: "email",
  websiteUrl: "",
  budgetRange: "unknown",
  timeline: "flexible",
  services: [],
  message: "",
  honeypot: "",
};

export const LeadForm = ({ leadType, submitLabel }: LeadFormProps) => {
  const { messages, locale } = useLanguage();
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const serviceOptions = useMemo(
    () =>
      [
        { label: "Website redesign", value: "website-redesign" },
        { label: "SEO setup", value: "seo" },
        { label: "Maintenance", value: "maintenance" },
      ] as const,
    [],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleService = (service: ServiceOption) => {
    setForm((prev) => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((item) => item !== service)
          : [...prev.services, service],
      };
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    try {
      await submitLead(leadType, locale, {
        fullName: form.fullName,
        email: form.email,
        company: form.company,
        phone: form.phone || null,
        preferredContact: form.preferredContact,
        websiteUrl: form.websiteUrl || null,
        budgetRange: form.budgetRange,
        timeline: form.timeline,
        services: form.services,
        message: form.message,
        honeypot: form.honeypot,
      });
      setStatus("success");
      setForm(initialState);
      trackEvent("lead_submit_success", { leadType });
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-5">
      <div>
        <h3 className="text-base font-semibold text-zinc-100">{messages.leadForm.title}</h3>
        <p className="text-sm text-zinc-400">{messages.leadForm.subtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-zinc-300">
          {messages.leadForm.fullName}
          <input
            required
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
        <label className="text-sm text-zinc-300">
          {messages.leadForm.email}
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-zinc-300">
          {messages.leadForm.company}
          <input
            required
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
        <label className="text-sm text-zinc-300">
          {messages.leadForm.phone}
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-zinc-300">
          {messages.leadForm.preferredContact}
          <select
            value={form.preferredContact}
            onChange={(e) => update("preferredContact", e.target.value as PreferredContact)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="email">{messages.leadForm.optionEmail}</option>
            <option value="phone">{messages.leadForm.optionPhone}</option>
          </select>
        </label>
        <label className="text-sm text-zinc-300">
          {messages.leadForm.websiteUrl}
          <input
            value={form.websiteUrl}
            onChange={(e) => update("websiteUrl", e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-zinc-300">
          {messages.leadForm.budgetRange}
          <select
            value={form.budgetRange}
            onChange={(e) => update("budgetRange", e.target.value as BudgetRange)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="under_2k">Under CAD $2,000</option>
            <option value="2k_5k">CAD $2,000-$5,000</option>
            <option value="5k_10k">CAD $5,000-$10,000</option>
            <option value="10k_plus">CAD $10,000+</option>
            <option value="unknown">Not sure yet</option>
          </select>
        </label>
        <label className="text-sm text-zinc-300">
          {messages.leadForm.timeline}
          <select
            value={form.timeline}
            onChange={(e) => update("timeline", e.target.value as TimelineOption)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="asap">ASAP</option>
            <option value="1_month">Within 1 month</option>
            <option value="2_3_months">2-3 months</option>
            <option value="flexible">Flexible</option>
          </select>
        </label>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm text-zinc-300">{messages.leadForm.services}</legend>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map((option) => (
            <label
              key={option.value}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200"
            >
              <input
                type="checkbox"
                checked={form.services.includes(option.value)}
                onChange={() => toggleService(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="text-sm text-zinc-300">
        {messages.leadForm.message}
        <textarea
          required
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
      </label>

      <input
        tabIndex={-1}
        autoComplete="off"
        value={form.honeypot}
        onChange={(e) => update("honeypot", e.target.value)}
        className="hidden"
        aria-hidden
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-70"
      >
        {submitLabel ?? messages.cta.submit}
      </button>

      {status === "success" ? (
        <p className="text-sm text-emerald-400">{messages.leadForm.success}</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-400">{messages.leadForm.failure}</p>
      ) : null}
    </form>
  );
};
