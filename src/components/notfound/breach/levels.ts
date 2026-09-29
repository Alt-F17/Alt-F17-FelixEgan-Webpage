/**
 * BREACH: the 10-level game hosted by the 404 page.
 * Plaintext answers never ship. Levels 1-7 are checked against a salted SHA-256,
 * text that has to appear on screen is XOR-masked so grepping the bundle doesn't
 * hand it over, and levels 8-10 are verified by behavior (a forged session, a
 * timed trace, a validator) instead of a stored answer.
 */

export type LevelWidget = "cipher" | "leak" | "trace" | "validator";

export type Level = {
  n: number;
  name: string;
  brief: string[];
  hint: string;
  hash?: string;
  widget?: LevelWidget;
};

const MASK = "fe404";

export function unmask(b64: string): string {
  const raw = atob(b64);
  let out = "";
  for (let i = 0; i < raw.length; i++) out += String.fromCharCode(raw.charCodeAt(i) ^ MASK.charCodeAt(i % MASK.length));
  return out;
}

export async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const normalize = (s: string) => s.trim().toLowerCase();

export async function checkAnswer(level: Level, answer: string): Promise<boolean> {
  if (!level.hash) return false;
  return (await sha256(`fe404:L${level.n}:${normalize(answer)}`)) === level.hash;
}

export const PAYLOAD = {
  behind: "LSBtbwRXRQkQVxMXQFFdCEhXUVgK",
  otherSide: "LSBtbwRVRQkQVgoQUR1EDwlY",
  console: "BQpaQ1sKABlTWxEHW0k=",
  morse: "CRdWWUA=",
  base64: "YmFzZTY0LWlzLW5vdC1lbmNyeXB0aW9u",
  cipher: "VK-KL-SILKV",
  xor: "1b 1a 00 59 08 1a 43 44 17 12 41 03 14 1b 5f 1d 0f 1f 0b 5f 10 04",
};

export const LEVELS: Level[] = [
  {
    n: 1,
    name: "behind",
    brief: ["Something on this page is sitting on top of the first key.", "Find it, then: key <answer>"],
    hint: "Windows here aren't glued down. Grab one by its title bar.",
    hash: "905fefc881a6d18561b1e93cefa8fc98bdf78f3dba0d1324c1422c66ff5d85c2",
  },
  {
    n: 2,
    name: "encoding",
    brief: ["Intercepted on the wire:", `  ${PAYLOAD.base64}`],
    hint: "A-Z, a-z, 0-9, + and /. Six bits per character.",
    hash: "3c8f23d284b27cb03c2b981615c11586f6fe09380dfc7bd3ef12d242e7655965",
  },
  {
    n: 3,
    name: "other side",
    brief: ["KEY_03 was written on the blue side.", "The green half is sitting on top of it."],
    hint: "The seam moves. Grab the handle on the glowing line and push it back.",
    hash: "e7e4fded9a39cab9b3a540b80a56d4901f7e9955472ef97d330516da1e196aa6",
  },
  {
    n: 4,
    name: "dial",
    brief: ["An old Roman locked this one. A dial just opened."],
    hint: "Drag the inner ring around. Exactly one of the 26 positions reads like words.",
    hash: "181cb8c8c3f2e99291123409b4246342887d7e7904ebc8622b2d740a799dc44d",
    widget: "cipher",
  },
  {
    n: 5,
    name: "console",
    brief: ["This key was never rendered. It was logged.", "It gets logged again every time you run: brief"],
    hint: "F12, or Ctrl+Shift+I / Cmd+Opt+I. Expand what you find. Not everything in there is honest.",
    hash: "d4b791c7e0fdb0c9c75ebf52463d569f75f6e44cfe41382647cc26e2d4009085",
  },
  {
    n: 6,
    name: "signal",
    brief: ["Look up at the stars on the blue side.", "One of them isn't twinkling. It's talking."],
    hint: "Dots and dashes. Letters are split by longer gaps, and the word repeats after a long pause.",
    hash: "53465a49cf21b809a875302e025badc8752adeb5af53d6fd209f1651e63355f1",
  },
  {
    n: 7,
    name: "xor",
    brief: ["Encrypted with a key you've already typed once:", `  ${PAYLOAD.xor}`],
    hint: "Repeating-key XOR. The key is one of your earlier answers, byte for byte. CyberChef can do it.",
    hash: "44e3d360dcfd3e6dc93225cc2f1a0d3cd2f408c9f5eca70fe787c839fb1835a6",
  },
  {
    n: 8,
    name: "privilege",
    brief: [
      "access denied: role=guest",
      "Your session lives in this browser, and someone leaked the signing code.",
      "Become admin, then: sudo breach",
    ],
    hint: "localStorage['fe404.session'] is base64(json) + '.' + signature. Change the role, re-sign, sudo breach.",
    widget: "leak",
  },
  {
    n: 9,
    name: "trace",
    brief: [
      "Type: trace",
      "A code flashes. Type it back before the window closes.",
      "Three in a row, each one longer and faster. One miss and you start over.",
    ],
    hint: "Nothing in that window is in the DOM. Your eyes, or your screenshot key.",
    widget: "trace",
  },
  {
    n: 10,
    name: "reverse",
    brief: ["The last door checks your key with the function in the new window.", "Any string it accepts opens it: key <answer>"],
    hint: "Start from the constraints that pin one character. The rolling checksum at the end is the only hard part; brute force what's left.",
    widget: "validator",
  },
];

// ---- level 5: console ----------------------------------------------------
export function logConsoleLevel() {
  const style = "background:#000208;color:#35ff8f;font:600 13px 'IBM Plex Mono',monospace;padding:6px 10px;border:1px solid #35ff8f";
  console.log("%cBREACH // level 05", style);
  console.log("session dump:", {
    level: 5,
    key: "not-this-one",
    payload: { encoding: "none", layers: [{ key: "keep-digging" }, { note: "nearly", inner: { key: unmask(PAYLOAD.console) } }] },
  });
  console.debug("fe404: decoy", { key: "definitely-the-key" });
}

// ---- level 6: morse ------------------------------------------------------
const MORSE: Record<string, string> = {
  a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--",
  n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--..",
};

/** On/off timeline in morse units for the level-6 word, followed by a long pause. */
export function morseTimeline(): { on: boolean; units: number }[] {
  const word = unmask(PAYLOAD.morse);
  const out: { on: boolean; units: number }[] = [];
  [...word].forEach((ch, li) => {
    if (li > 0) out.push({ on: false, units: 3 });
    [...MORSE[ch]].forEach((sym, si) => {
      if (si > 0) out.push({ on: false, units: 1 });
      out.push({ on: true, units: sym === "." ? 1 : 3 });
    });
  });
  out.push({ on: false, units: 10 });
  return out;
}

// ---- level 8: session forging -------------------------------------------
export const SESSION_KEY = "fe404.session";

export const LEAKED_SOURCE = `// auth/session.js (leaked)
function sign(payload) {
  let h = 0x811c9dc5;
  for (const ch of payload + "fe404") {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

// session = btoa(JSON.stringify(user)) + "." + sign(btoa(...))
function isAdmin(session) {
  const [p, sig] = session.split(".");
  return sign(p) === sig && JSON.parse(atob(p)).role === "admin";
}`;

export function sign(payload: string): string {
  let h = 0x811c9dc5;
  for (const ch of payload + "fe404") {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function guestSession(): string {
  const p = btoa(JSON.stringify({ user: "guest", role: "guest" }));
  return `${p}.${sign(p)}`;
}

export function isAdmin(session: string | null): boolean {
  if (!session) return false;
  try {
    const [p, sig] = session.split(".");
    return sign(p) === sig && JSON.parse(atob(p)).role === "admin";
  } catch {
    return false;
  }
}

// ---- level 9: trace rounds ----------------------------------------------
export const TRACE_ROUNDS = [
  { len: 8, flashMs: 1500 },
  { len: 12, flashMs: 900 },
  { len: 16, flashMs: 550 },
];
export const TRACE_TYPE_MS = 15000;

export function randomHex(len: number): string {
  const b = new Uint8Array(Math.ceil(len / 2));
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("").slice(0, len);
}

// ---- level 10: validator ------------------------------------------------
export const VALIDATOR_SOURCE = `v=s=>{if(s.length!=10)return!1;
let c=[...s].map(x=>x.charCodeAt()),h=7;
if(c.some(x=>x<33||x>126))return!1;
if((c[0]^c[1])!=0x47)return!1;
if(c[4]-c[3]!=0x31)return!1;
if(c[2]*c[7]!=0x150e)return!1;
if((c[5]<<2)+c[6]!=0x11a)return!1;
if(c[8]-c[0]!=7)return!1;
if((c[9]^0x5a)!=0x7b)return!1;
if((c[1]+c[3]&0xff)!=0xaa)return!1;
for(let x of c)h=Math.imul(h,31)+x>>>0;
return h%1000003==0xf151d}`;

export function validate(s: string): boolean {
  if (s.length !== 10) return false;
  const c = [...s].map((x) => x.charCodeAt(0));
  if (c.some((x) => x < 33 || x > 126)) return false;
  if ((c[0] ^ c[1]) !== 0x47) return false;
  if (c[4] - c[3] !== 0x31) return false;
  if (c[2] * c[7] !== 0x150e) return false;
  if ((c[5] << 2) + c[6] !== 0x11a) return false;
  if (c[8] - c[0] !== 7) return false;
  if ((c[9] ^ 0x5a) !== 0x7b) return false;
  if (((c[1] + c[3]) & 0xff) !== 0xaa) return false;
  let h = 7;
  for (const x of c) h = (Math.imul(h, 31) + x) >>> 0;
  return h % 1000003 === 0xf151d;
}
