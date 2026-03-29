import { useMemo } from "react";
import { trackEvent } from "@/lib/plausible";

const fallbackCalendar = "https://calendly.com/";

export const CalendarEmbed = () => {
  const calendarUrl = useMemo(
    () => import.meta.env.VITE_CALENDLY_URL ?? fallbackCalendar,
    [],
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-100">Book a Discovery Call</h3>
        <a
          href={calendarUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent("calendar_open", { mode: "external" })}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Open in new tab
        </a>
      </div>
      <iframe
        title="Discovery call booking"
        src={calendarUrl}
        className="h-[620px] w-full rounded-lg border border-zinc-800"
        onLoad={() => trackEvent("calendar_open", { mode: "embedded" })}
      />
    </div>
  );
};
