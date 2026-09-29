import { useEffect, useRef, useState } from "react";
import type { SiteContent, TermLine } from "@/content/siteContent";
import {
  LEVELS,
  SESSION_KEY,
  TRACE_ROUNDS,
  TRACE_TYPE_MS,
  checkAnswer,
  isAdmin,
  logConsoleLevel,
  randomHex,
  sign,
  validate,
  type Level,
} from "./breach/levels";
import { fmtDuration, type Progress } from "./breach/progress";
import type { Flash } from "./widgets";

const mono = "'IBM Plex Mono',monospace";

type Line = { c: string; t: string; pre?: boolean };

export type ShellApi = {
  progress: Progress;
  start: () => void;
  advance: () => void;
  reset: () => void;
  tidy: () => void;
  seamReset: () => void;
  navigate: (path: string) => void;
  setFlash: (f: Flash) => void;
  win: () => void;
};

const COMMANDS = [
  "help", "breach", "brief", "hint", "key", "status", "trace", "sudo", "reset",
  "whoami", "ls", "cat", "cd", "home", "tidy", "seam", "banner", "clear", "exit",
];

const ROUTES: Record<string, string> = {
  "~": "/", "/": "/", "~/": "/", home: "/",
  projects: "/projects", "~/projects": "/projects", "/projects": "/projects",
  studio: "/studio", "~/studio": "/studio", "/studio": "/studio",
  paste: "/paste", "~/paste": "/paste", "/paste": "/paste",
};

export function BreachShell({ content, api, mobile }: { content: SiteContent; api: ShellApi; mobile: boolean }) {
  const colors = content.terminal.colors;
  const col = (k: string) => colors[k] ?? k;
  const L = (c: string, t: string, pre = false): Line => ({ c: col(c), t, pre });
  const { progress } = api;
  const started = progress.startedAt !== null;
  const done = progress.level > LEVELS.length;
  const current: Level | undefined = LEVELS[progress.level - 1];

  const boot = (): Line[] => {
    const out = [L("label", "breach v0.404 // route not found"), L("dim", "")];
    if (done) out.push(L("ok", "felixegan.me is already breached. 'status' for your times, 'reset' to go again."));
    else if (started) out.push(L("warn", `session restored: level ${progress.level}/10. type 'brief' to see it again.`));
    else out.push(L("val", "type 'help' for commands, or 'breach' if you think you're good."));
    return out;
  };

  const [lines, setLines] = useState<Line[]>(boot);
  const [input, setInput] = useState("");
  const hist = useRef<string[]>([]);
  const hIdx = useRef(-1);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const trace = useRef<{ round: number; code: string; phase: "flash" | "type" } | null>(null);
  const timers = useRef<number[]>([]);

  const print = (arr: Line[]) => setLines((s) => [...s, ...arr].slice(-400));

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    if (!mobile) inputRef.current?.focus({ preventScroll: true });
    const ts = timers.current;
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, [mobile]);

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };

  const briefLines = (lv: Level): Line[] => {
    if (lv.n === 5) logConsoleLevel();
    return [
      L("dim", ""),
      L("label", `── level ${String(lv.n).padStart(2, "0")} // ${lv.name} ${"─".repeat(Math.max(4, 28 - lv.name.length))}`),
      ...lv.brief.map((t) => L("val", t, true)),
    ];
  };

  const clear = (n: number): Line[] => {
    const now = Date.now();
    const prev = progress.splits.length ? progress.splits[progress.splits.length - 1] : progress.startedAt ?? now;
    const next = LEVELS[n];
    const out = [L("ok", `[  OK  ] level ${String(n).padStart(2, "0")} cleared in ${fmtDuration(now - prev)}`)];
    if (n === 4) out.push(L("warn", "[ WARN ] warm-up's over."));
    return next ? [...out, ...briefLines(next)] : out;
  };

  const winGame = () => {
    api.advance();
    print([L("ok", "[  OK  ] level 10 cleared"), L("warn", "[ WARN ] root obtained. felixegan.me is yours.")]);
    later(() => api.win(), 500);
  };

  const failTrace = (why: string) => {
    trace.current = null;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    api.setFlash(null);
    print([L("err", `[ FAIL ] ${why}. back to round 1. run 'trace' to try again.`)]);
  };

  const runRound = (i: number) => {
    const r = TRACE_ROUNDS[i];
    const code = randomHex(r.len);
    trace.current = { round: i, code, phase: "flash" };
    api.setFlash({ code, round: i + 1, total: TRACE_ROUNDS.length });
    print([L("label", `round ${i + 1}/${TRACE_ROUNDS.length}: eyes on the trace window.`)]);
    later(() => {
      if (!trace.current) return;
      trace.current.phase = "type";
      api.setFlash({ code: null, round: i + 1, total: TRACE_ROUNDS.length });
      print([L("val", `type it. ${TRACE_TYPE_MS / 1000}s.`)]);
      later(() => {
        if (trace.current?.round === i && trace.current.phase === "type") failTrace("too slow");
      }, TRACE_TYPE_MS);
    }, r.flashMs);
  };

  const onTraceInput = (raw: string) => {
    const t = trace.current;
    if (!t) return;
    if (t.phase === "flash") {
      print([L("dim", "eyes on the window.")]);
      return;
    }
    timers.current.forEach((x) => window.clearTimeout(x));
    timers.current = [];
    if (raw.trim().toLowerCase() !== t.code) {
      failTrace(`expected ${t.code}`);
      return;
    }
    if (t.round + 1 < TRACE_ROUNDS.length) {
      print([L("ok", "match.")]);
      later(() => runRound(t.round + 1), 700);
      return;
    }
    trace.current = null;
    api.setFlash(null);
    api.advance();
    print(clear(9));
  };

  const run = async (raw: string) => {
    const cmdline = raw.trim();
    print([{ c: "#eaffef", t: `root@alt-f17:~# ${raw}` }]);
    if (trace.current) {
      onTraceInput(cmdline);
      return;
    }
    if (!cmdline) return;
    const [cmd, ...rest] = cmdline.split(/\s+/);
    const arg = rest.join(" ");
    const c = cmd.toLowerCase();
    const contentCmd = content.terminal.commands[cmdline.toLowerCase()];

    switch (c) {
      case "help":
        print([
          L("label", "game"),
          L("dim", "  breach        start or resume BREACH (10 levels)"),
          L("dim", "  brief / hint  show the current level / get a nudge"),
          L("dim", "  key <answer>  submit a key"),
          L("dim", "  status        level, time, splits"),
          L("dim", "  reset         wipe your progress"),
          L("label", "shell"),
          L("dim", "  cd <route>    ~, projects, studio, paste"),
          L("dim", "  whoami, ls, cat <file>, banner, clear"),
          L("dim", "  tidy          put the windows back"),
          L("dim", "  seam reset    re-center the seam"),
        ]);
        return;
      case "breach": {
        if (done) {
          print([L("ok", "already breached."), ...statusLines()]);
          return;
        }
        const intro: Line[] = [];
        if (!started) {
          api.start();
          intro.push(
            L("warn", "BREACH // 10 levels. 1 to 4 are a warm-up. 5 to 10 are not."),
            L("dim", "submit with: key <answer>   stuck: hint   progress saves in this browser."),
          );
          if (mobile) intro.push(L("dim", "heads up: levels 5 and 8 need desktop devtools."));
        }
        print([...intro, ...briefLines(current!)]);
        return;
      }
      case "brief":
        if (!started) print([L("dim", "nothing to brief yet. run: breach")]);
        else if (done) print(statusLines());
        else print(briefLines(current!));
        return;
      case "hint":
        if (!started || done) print([L("dim", "no active level.")]);
        else print([L("warn", `hint: ${current!.hint}`)]);
        return;
      case "key": {
        if (!started) return print([L("dim", "run 'breach' first.")]);
        if (done) return print([L("dim", "already breached.")]);
        if (!arg) return print([L("err", "usage: key <answer>")]);
        const lv = current!;
        if (lv.n === 8) return print([L("dim", "this one isn't a key. read the brief again.")]);
        if (lv.n === 9) return print([L("dim", "this one isn't a key. run: trace")]);
        if (lv.n === 10) {
          if (validate(arg)) winGame();
          else print([L("err", "[ FAIL ] v(s) returned false")]);
          return;
        }
        let ok = false;
        try {
          ok = await checkAnswer(lv, arg);
        } catch {
          return print([L("err", "crypto unavailable here. BREACH needs https or localhost.")]);
        }
        if (ok) {
          api.advance();
          print(clear(lv.n));
        } else print([L("err", "[ FAIL ] access denied")]);
        return;
      }
      case "sudo": {
        if (arg.toLowerCase() !== "breach" || !started || current?.n !== 8) {
          print([L("err", "sudo: permission denied. nice try.")]);
          return;
        }
        let session: string | null = null;
        try {
          session = localStorage.getItem(SESSION_KEY);
        } catch {
          /* storage blocked */
        }
        if (isAdmin(session)) {
          api.advance();
          print([L("ok", "[sudo] role=admin verified."), ...clear(8)]);
          return;
        }
        const [p, sig] = (session ?? "").split(".");
        if (!p || sign(p) !== sig) print([L("err", "access denied: invalid signature")]);
        else print([L("err", "access denied: role is not admin")]);
        return;
      }
      case "trace":
        if (!started || current?.n !== 9) {
          print([L("dim", "trace: nothing to trace yet.")]);
          return;
        }
        runRound(0);
        return;
      case "status":
        print(statusLines());
        return;
      case "reset":
        if (arg !== "--yes") {
          print([L("warn", "this wipes your BREACH progress. type: reset --yes")]);
          return;
        }
        try {
          localStorage.removeItem(SESSION_KEY);
        } catch {
          /* storage blocked */
        }
        api.reset();
        api.setFlash(null);
        print([L("ok", "progress wiped. run 'breach' when ready.")]);
        return;
      case "cd": {
        const to = ROUTES[arg.toLowerCase() || "~"];
        if (to) {
          print([L("dim", `cd ${arg || "~"}`)]);
          api.navigate(to);
        } else print([L("err", `cd: no such route: ${arg}. (that's the theme of this page)`)]);
        return;
      }
      case "home":
        api.navigate("/");
        return;
      case "exit":
        print([L("warn", "there is no exit. try: cd ~")]);
        return;
      case "ls":
        print([L("val", "404.log   whoami.txt   trace.log   breach*"), L("warn", "-r--------   .keys/   (nice try)")]);
        return;
      case "tidy":
        api.tidy();
        print([L("dim", "windows restored.")]);
        return;
      case "seam":
        api.seamReset();
        print([L("dim", "seam re-centered.")]);
        return;
      case "banner":
        print([L("ok", content.terminal.banner.join("\n"), true)]);
        return;
      case "clear":
        setLines([]);
        return;
    }
    if (contentCmd) {
      print(contentCmd.map((l: TermLine) => ({ c: col(l.c ?? "val"), t: l.banner ? content.terminal.banner.join("\n") : l.t ?? "", pre: l.pre || l.banner })));
      return;
    }
    print([L("err", `bash: ${cmd}: command not found`)]);
  };

  const statusLines = (): Line[] => {
    if (!started) return [L("dim", "not started. run: breach")];
    const end = done ? progress.splits[progress.splits.length - 1] : Date.now();
    const out = [
      L("label", done ? "status: BREACHED" : `status: level ${progress.level}/10`),
      L("val", `elapsed: ${fmtDuration(end - progress.startedAt!)}`),
    ];
    let prev = progress.startedAt!;
    progress.splits.forEach((s, i) => {
      out.push(L("dim", `  level ${String(i + 1).padStart(2, "0")}  ${fmtDuration(s - prev)}`));
      prev = s;
    });
    return out;
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const v = input;
      if (v.trim()) hist.current.unshift(v);
      hIdx.current = -1;
      setInput("");
      void run(v);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hIdx.current < hist.current.length - 1) setInput(hist.current[++hIdx.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx.current > 0) setInput(hist.current[--hIdx.current]);
      else {
        hIdx.current = -1;
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const m = COMMANDS.find((c) => c.startsWith(input.trim().toLowerCase()));
      if (m && input.trim()) setInput(m + " ");
    }
  };

  return (
    <div
      ref={bodyRef}
      className="term-scroll"
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
      style={{ position: "absolute", inset: 0, overflowY: "auto", padding: "10px 14px 14px", cursor: "text", fontFamily: mono, fontSize: 12.5, lineHeight: 1.6 }}
    >
      {lines.map((ln, i) => (
        <div key={i} style={{ color: ln.c, whiteSpace: ln.pre ? "pre" : "pre-wrap", wordBreak: ln.pre ? undefined : "break-word", overflowX: ln.pre ? "auto" : undefined }}>
          {ln.t || " "}
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
        <span style={{ color: "#7cffb0", whiteSpace: "nowrap" }}>
          root@alt-f17<span style={{ color: "#2f7d4f" }}>:</span>
          <span style={{ color: "#c9ffe0" }}>~</span>
          <span style={{ color: "#2f7d4f" }}>#</span>
        </span>
        <input
          ref={inputRef}
          className="term-in"
          aria-label="Terminal input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: 0,
            outline: 0,
            color: "var(--green,#35ff8f)",
            fontFamily: mono,
            fontSize: mobile ? 16 : 12.5,
            textShadow: "inherit",
            padding: "2px 0",
          }}
        />
      </div>
    </div>
  );
}
