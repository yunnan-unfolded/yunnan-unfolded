import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMax = 5;
const recentRequests = new Map<string, number[]>();
const recentSubmissions = new Map<string, number>();

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

function readString(source: Record<string, unknown>, key: string, maxLength: number) {
  const value = source[key];
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function parseEnquiry(source: unknown): Enquiry | null {
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const data = source as Record<string, unknown>;
  const interests = Array.isArray(data.interests)
    ? data.interests.filter((item): item is string => typeof item === "string").slice(0, 15).map((item) => item.trim().slice(0, 100))
    : [];
  return {
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

function validate(enquiry: Enquiry) {
  if (!enquiry.name) return "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) return "Please enter a valid email address.";
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
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function formatValue(value: string | string[]) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not specified";
  return value || "Not specified";
}

function getClientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "local";
}

function isRateLimited(address: string, now: number) {
  const previous = (recentRequests.get(address) ?? []).filter((time) => now - time < rateLimitWindowMs);
  previous.push(now);
  recentRequests.set(address, previous);
  return previous.length > rateLimitMax;
}

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ code, message }, { status });
}

function readProviderToken(source: unknown, key: string) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return "unknown";
  const value = (source as Record<string, unknown>)[key];
  if (typeof value !== "string" || !/^[a-zA-Z0-9_.-]{1,80}$/.test(value)) return "unknown";
  return value;
}

export async function POST(request: Request) {
  console.info("[enquiries] request_received");

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 32_000) return errorResponse("INVALID_FORM", "That enquiry is too large to send. Please shorten the notes and try again.", 413);

  const now = Date.now();
  const address = getClientAddress(request);
  if (isRateLimited(address, now)) return errorResponse("RATE_LIMITED", "There have been several recent attempts. Please wait a few minutes and try again.", 429);

  let source: unknown;
  try {
    source = await request.json();
  } catch {
    return errorResponse("INVALID_FORM", "We couldn’t read those details. Please review the form and try again.", 400);
  }

  const enquiry = parseEnquiry(source);
  if (!enquiry) return errorResponse("INVALID_FORM", "We couldn’t read those details. Please review the form and try again.", 400);
  if (enquiry.company || !enquiry.startedAt || now - enquiry.startedAt < 1_200 || now - enquiry.startedAt > 7 * 24 * 60 * 60 * 1000) {
    return errorResponse("INVALID_FORM", "We couldn’t verify this enquiry. Please refresh the page and try again.", 400);
  }

  const validationMessage = validate(enquiry);
  if (validationMessage) return errorResponse("INVALID_FORM", validationMessage, 400);

  const fingerprint = createHash("sha256")
    .update(JSON.stringify({ ...enquiry, startedAt: undefined }))
    .digest("hex");
  const lastSent = recentSubmissions.get(fingerprint);
  if (lastSent && now - lastSent < 10 * 60 * 1000) {
    return errorResponse("DUPLICATE_ENQUIRY", "This enquiry was already sent recently. There’s no need to send it again.", 409);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.INQUIRY_TO_EMAIL;
  if (!apiKey || !from || !to) {
    return errorResponse("SERVICE_NOT_CONFIGURED", "Our online enquiry service isn’t configured yet. Please try again later.", 503);
  }

  const details: Array<[string, string | string[]]> = [
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
  const html = `<h1>New Yunnan travel enquiry</h1><table style="border-collapse:collapse;width:100%;max-width:720px">${details.map(([label, value]) => `<tr><th style="padding:8px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(formatValue(value))}</td></tr>`).join("")}</table>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": fingerprint,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: enquiry.email,
        subject: `Yunnan travel ideas from ${enquiry.name}`,
        text,
        html,
      }),
    });
    if (!response.ok) {
      const providerBody = await response.json().catch(() => null);
      console.error("[enquiries] provider_rejected", {
        status: response.status,
        errorType: readProviderToken(providerBody, "name"),
        errorCode: readProviderToken(providerBody, "code"),
      });
      return errorResponse("RESEND_REJECTED", "Our email service declined this request. Please review your details or try again shortly.", 502);
    }
  } catch (error) {
    console.error("[enquiries] provider_network_exception", {
      exceptionType: error instanceof Error ? error.name : "UnknownError",
    });
    return errorResponse("RESEND_UNAVAILABLE", "The server can’t connect to our email service right now. Please try again shortly.", 503);
  }

  recentSubmissions.set(fingerprint, now);
  return NextResponse.json({ ok: true }, { status: 201 });
}
