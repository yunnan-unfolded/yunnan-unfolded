import worker from "../src/index.ts";

const allowedOrigin = "https://yunnan-unfolded.github.io";
const env = {
  RESEND_API_KEY: "test-only",
  RESEND_FROM_EMAIL: "Yunnan Unfolded <enquiries@yunnanunfolded.com>",
  INQUIRY_TO_EMAIL: "hello@yunnanunfolded.com",
  ALLOWED_ORIGINS: `${allowedOrigin},http://localhost:3000`,
};
const calls = [];

globalThis.fetch = async (url, init) => {
  calls.push({ url: String(url), init });
  return new Response(JSON.stringify({ id: "test" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

function request(body, options = {}) {
  return new Request("https://worker.example/enquiries", {
    method: options.method || "POST",
    headers: {
      Origin: options.origin || allowedOrigin,
      ...(options.headers || { "Content-Type": "application/json" }),
    },
    body: options.method === "OPTIONS" ? undefined : body,
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const preflight = await worker.fetch(request(undefined, { method: "OPTIONS", headers: {} }), env);
assert(preflight.status === 204, "CORS preflight should return 204");
assert(preflight.headers.get("Access-Control-Allow-Origin") === allowedOrigin, "CORS should echo the allowed origin");
assert(preflight.headers.get("Access-Control-Allow-Origin") !== "*", "CORS must not use a wildcard");

const blocked = await worker.fetch(request("{}", { origin: "https://example.com" }), env);
assert(blocked.status === 403, "A disallowed origin should be rejected");

const unsupported = await worker.fetch(request("{}", { headers: { "Content-Type": "text/plain" } }), env);
assert(unsupported.status === 415, "A non-JSON request should be rejected");

const wrongMethod = await worker.fetch(request(undefined, { method: "GET", headers: {} }), env);
assert(wrongMethod.status === 405, "A method other than POST or OPTIONS should be rejected");

const malformed = await worker.fetch(request("{"), env);
assert(malformed.status === 400, "Malformed JSON should be rejected");

const oversized = await worker.fetch(request(JSON.stringify({ notes: "x".repeat(32_001) })), env);
assert(oversized.status === 413, "An oversized body should be rejected");

const invalidEmail = await worker.fetch(request(JSON.stringify({
  source: "homepage",
  name: "Ada",
  email: "invalid",
  company: "",
  startedAt: Date.now() - 2_000,
})), env);
assert(invalidEmail.status === 400, "An invalid email should be rejected");

const callsBeforeHoneypot = calls.length;
const honeypot = await worker.fetch(request(JSON.stringify({ company: "bot" })), env);
assert(honeypot.status === 200, "The honeypot should return a generic success");
assert(calls.length === callsBeforeHoneypot, "The honeypot must not call Resend");

const baseSubmission = {
  name: "[TEST] <b>Ada</b>",
  email: "ada@example.com",
  contact: "",
  origin: "",
  timing: "Not sure yet",
  exactStart: "",
  exactEnd: "",
  length: "",
  party: "",
  travellerCount: "",
  interests: ["Tea & coffee"],
  pace: "",
  walking: "",
  accommodation: "",
  places: "",
  budget: "",
  notes: "",
  company: "",
  startedAt: Date.now() - 2_000,
};

const quick = await worker.fetch(request(JSON.stringify({ source: "homepage", ...baseSubmission })), env);
assert(quick.status === 201, "A homepage enquiry should be accepted");
const quickMail = JSON.parse(calls.at(-1).init.body);
assert(quickMail.subject.startsWith("[TEST] Homepage quick inquiry"), "The homepage test subject should identify the quick form");
assert(quickMail.reply_to === baseSubmission.email, "The customer email should be used as reply_to");
assert(quickMail.html.includes("&lt;b&gt;Ada&lt;/b&gt;"), "Customer HTML should be escaped");
assert(!quickMail.html.includes("<b>Ada</b>"), "Customer HTML must not execute");

const detailed = await worker.fetch(request(JSON.stringify({
  source: "detailed",
  ...baseSubmission,
  timing: "I’m not sure yet",
})), env);
assert(detailed.status === 201, "A detailed enquiry should be accepted");
const detailedMail = JSON.parse(calls.at(-1).init.body);
assert(detailedMail.subject.startsWith("[TEST] Detailed trip inquiry"), "The detailed test subject should identify the full planner");

console.log("Worker contract tests passed.");
