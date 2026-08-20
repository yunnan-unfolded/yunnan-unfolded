const MAX_BODY_BYTES = 32_000;
const MAX_SUBMISSION_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_SUBMISSION_AGE_MS = 800;

const allowedTiming = new Set([
  "",
  "I have exact dates",
  "I know the approximate month",
  "My dates are flexible",
  "I’m not sure yet",
  "Not sure yet",
  "January–March",
  "April–June",
  "July–September",
  "October–December",
]);
const allowedLengths = new Set(["", "4–6 days", "7–9 days", "10–14 days", "15 days or more", "I’m not sure yet"]);
const allowedParties = new Set(["", "Travelling on my own", "A couple", "Family with children", "Friends", "A private group"]);
const allowedPaces = new Set(["", "Slow and spacious", "A balanced rhythm", "I like to see as much as possible", "I’m not sure yet"]);
const allowedWalking = new Set(["", "Gentle walks", "Occasional half-day hikes", "Full-day hikes", "Multi-day trekking", "I’d prefer very little walking", "I’m not sure yet"]);
const allowedAccommodation = new Set(["", "Simple places with local character", "Comfortable boutique hotels", "High-end stays", "A thoughtful mix", "I’m open to your suggestions"]);
const allowedBudgets = new Set(["", "I’d like some guidance", "Under US$1,500 per person", "US$1,500–2,500 per person", "US$2,500–4,000 per person", "US$4,000+ per person"]);

type Enquiry = {
  source: string;
  name: string;
  email: string;
  contact: string;
  origin: string;
  timing: string;
  exactStart: string;
  exactEnd: string;
  length: string;
  party: string;
  travellerCount: string;
  interests: string[];
  pace: string;
  walking: string;
  accommodation: string;
  places: string;
  budget: string;
  notes: string;
  company: string;
  startedAt: number;
};

type JsonBody = {
  ok: boolean;
  code?: string;
  message: string;
};

function allowedOrigin(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  if (!origin) return null;

  const allowed = new Set(
    (env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  return allowed.has(origin) ? origin : null;
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

function json(body: JsonBody, status: number, origin?: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...(origin ? corsHeaders(origin) : {}),
    },
  });
}

function readString(source: Record<string, unknown>, key: string, maxLength: number) {
  const value = source[key];
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function parseEnquiry(source: unknown): Enquiry | null {
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const data = source as Record<string, unknown>;
  const interests = Array.isArray(data.interests)
    ? data.interests
        .filter((item): item is string => typeof item === "string")
        .slice(0, 15)
        .map((item) => item.trim().slice(0, 100))
    : [];

  return {
    source: readString(data, "source", 20),
    name: readString(data, "name", 100),
    email: readString(data, "email", 254).toLowerCase(),
    contact: readString(data, "contact", 100),
    origin: readString(data, "origin", 120),
    timing: readString(data, "timing", 80),
    exactStart: readString(data, "exactStart", 10),
    exactEnd: readString(data, "exactEnd", 10),
    length: readString(data, "length", 50),
    party: readString(data, "party", 50),
    travellerCount: readString(data, "travellerCount", 3),
    interests,
    pace: readString(data, "pace", 80),
    walking: readString(data, "walking", 80),
    accommodation: readString(data, "accommodation", 100),
    places: readString(data, "places", 500),
    budget: readString(data, "budget", 80),
    notes: readString(data, "notes", 3000),
    company: readString(data, "company", 120),
    startedAt: typeof data.startedAt === "number" ? data.startedAt : 0,
  };
}

function validate(enquiry: Enquiry, now: number) {
  if (enquiry.source !== "homepage" && enquiry.source !== "detailed") return "Please refresh the page and try again.";
  if (!enquiry.name) return "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) return "Please enter a valid email address.";
  if (!enquiry.startedAt || now - enquiry.startedAt < MIN_SUBMISSION_AGE_MS || now - enquiry.startedAt > MAX_SUBMISSION_AGE_MS) return "Please refresh the page and try again.";
  if (!allowedTiming.has(enquiry.timing) || !allowedLengths.has(enquiry.length) || !allowedParties.has(enquiry.party)) return "Some travel details weren’t recognised. Please review them and try again.";
  if (!allowedPaces.has(enquiry.pace) || !allowedWalking.has(enquiry.walking) || !allowedAccommodation.has(enquiry.accommodation) || !allowedBudgets.has(enquiry.budget)) return "Some travel preferences weren’t recognised. Please review them and try again.";
  if (enquiry.timing === "I have exact dates") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(enquiry.exactStart) || !/^\d{4}-\d{2}-\d{2}$/.test(enquiry.exactEnd)) return "Please include both exact travel dates.";
    if (enquiry.exactEnd < enquiry.exactStart) return "The departure date needs to be after the arrival date.";
  }
  if (enquiry.travellerCount && (!/^\d+$/.test(enquiry.travellerCount) || Number(enquiry.travellerCount) < 1 || Number(enquiry.travellerCount) > 50)) return "Please enter a traveller count between 1 and 50.";
  return null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function formatValue(value: string | string[]) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not specified";
  return value || "Not specified";
}

function providerToken(source: unknown, key: string) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return "unknown";
  const value = (source as Record<string, unknown>)[key];
  if (typeof value !== "string" || !/^[a-zA-Z0-9_.-]{1,80}$/.test(value)) return "unknown";
  return value;
}

async function readBoundedBody(request: Request) {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    byteLength += value.byteLength;
    if (byteLength > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

async function fingerprint(enquiry: Enquiry) {
  const canonical = JSON.stringify({ ...enquiry, company: undefined, startedAt: undefined });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function handleEnquiry(request: Request, env: Env, origin: string) {
  const contentType = request.headers.get("Content-Type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return json({ ok: false, code: "UNSUPPORTED_MEDIA_TYPE", message: "Please send the enquiry as JSON." }, 415, origin);
  }

  const declaredLength = Number(request.headers.get("Content-Length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, code: "INVALID_FORM", message: "That enquiry is too large to send. Please shorten the notes and try again." }, 413, origin);
  }

  const bodyText = await readBoundedBody(request);
  if (bodyText === null) {
    return json({ ok: false, code: "INVALID_FORM", message: "That enquiry is too large to send. Please shorten the notes and try again." }, 413, origin);
  }

  let body: unknown;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return json({ ok: false, code: "INVALID_FORM", message: "We couldn’t read those details. Please review the form and try again." }, 400, origin);
  }

  const enquiry = parseEnquiry(body);
  if (!enquiry) {
    return json({ ok: false, code: "INVALID_FORM", message: "We couldn’t read those details. Please review the form and try again." }, 400, origin);
  }

  if (enquiry.company) {
    return json({ ok: true, message: "Thank you. We’ve received your enquiry." }, 200, origin);
  }

  const validationMessage = validate(enquiry, Date.now());
  if (validationMessage) return json({ ok: false, code: "INVALID_FORM", message: validationMessage }, 400, origin);

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.INQUIRY_TO_EMAIL) {
    return json({ ok: false, code: "SERVICE_NOT_CONFIGURED", message: "Our online enquiry service isn’t configured yet. Please try again later." }, 503, origin);
  }

  const inquiryType = enquiry.source === "homepage" ? "Homepage quick inquiry" : "Detailed trip inquiry";
  const subjectPrefix = enquiry.name.startsWith("[TEST]") ? "[TEST] " : "";
  const details: Array<[string, string | string[]]> = [
    ["Inquiry type", inquiryType],
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["WhatsApp / WeChat", enquiry.contact],
    ["Travelling from", enquiry.origin],
    ["Travel timing", enquiry.timing],
    ["Exact dates", enquiry.exactStart && enquiry.exactEnd ? `${enquiry.exactStart} to ${enquiry.exactEnd}` : ""],
    ["Time in Yunnan", enquiry.length],
    ["Travelling party", enquiry.party],
    ["Number of travellers", enquiry.travellerCount],
    ["Interests", enquiry.interests],
    ["Preferred pace", enquiry.pace],
    ["Walking and hiking", enquiry.walking],
    ["Accommodation", enquiry.accommodation],
    ["Places in mind", enquiry.places],
    ["Budget", enquiry.budget],
    ["Additional notes", enquiry.notes],
  ];
  const text = details.map(([label, value]) => `${label}: ${formatValue(value)}`).join("\n");
  const html = `<h1>${escapeHtml(inquiryType)}</h1><table style="border-collapse:collapse;width:100%;max-width:720px">${details
    .map(([label, value]) => `<tr><th style="padding:8px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(formatValue(value))}</td></tr>`)
    .join("")}</table>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": await fingerprint(enquiry),
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [env.INQUIRY_TO_EMAIL],
        reply_to: enquiry.email,
        subject: `${subjectPrefix}${inquiryType} from ${enquiry.name}`,
        text,
        html,
      }),
    });

    const providerBody = response.ok ? null : await response.json().catch(() => null);
    console.info(JSON.stringify({
      event: "resend_response",
      status: response.status,
      errorType: response.ok ? undefined : providerToken(providerBody, "name"),
      errorCode: response.ok ? undefined : providerToken(providerBody, "code"),
    }));

    if (!response.ok) {
      return json({ ok: false, code: "RESEND_REJECTED", message: "Our email service declined this request. Please try again shortly." }, 502, origin);
    }
  } catch (error) {
    console.error(JSON.stringify({
      event: "resend_network_exception",
      exceptionType: error instanceof Error ? error.name : "UnknownError",
    }));
    return json({ ok: false, code: "SERVICE_UNAVAILABLE", message: "The server can’t connect to our email service right now. Please try again shortly." }, 503, origin);
  }

  return json({ ok: true, message: "Thank you. We’ve received your enquiry and will be in touch within 24 hours." }, 201, origin);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = allowedOrigin(request, env);

    if (!origin) {
      return json({ ok: false, code: "ORIGIN_NOT_ALLOWED", message: "This request origin is not allowed." }, 403);
    }

    if (url.pathname !== "/enquiries") {
      return json({ ok: false, code: "NOT_FOUND", message: "Not found." }, 404, origin);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, code: "METHOD_NOT_ALLOWED", message: "Method not allowed." }), {
        status: 405,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Allow: "POST, OPTIONS",
          ...corsHeaders(origin),
        },
      });
    }

    console.info(JSON.stringify({ event: "request_received" }));
    return handleEnquiry(request, env, origin);
  },
};
