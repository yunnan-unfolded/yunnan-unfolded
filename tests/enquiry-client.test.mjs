import assert from "node:assert/strict";
import test from "node:test";
import { resolveEnquiryEndpoint } from "../app/lib/enquiryClient.ts";

test("accepts secure Worker URLs in production", () => {
  assert.equal(
    resolveEnquiryEndpoint("https://enquiries.example/enquiries", "production"),
    "https://enquiries.example/enquiries",
  );
});

test("rejects localhost HTTP endpoints in production", () => {
  assert.equal(resolveEnquiryEndpoint("http://localhost:8787/enquiries", "production"), null);
  assert.equal(resolveEnquiryEndpoint("http://127.0.0.1:8787/enquiries", "production"), null);
});

test("allows loopback HTTP only for local development", () => {
  assert.equal(
    resolveEnquiryEndpoint("http://127.0.0.1:8787/enquiries", "development"),
    "http://127.0.0.1:8787/enquiries",
  );
  assert.equal(resolveEnquiryEndpoint("http://worker.example/enquiries", "development"), null);
});


test("rejects reserved invalid preview endpoints", () => {
  assert.equal(resolveEnquiryEndpoint("https://enquiry-preview.invalid/enquiries", "development"), null);
  assert.equal(resolveEnquiryEndpoint("https://invalid/enquiries", "production"), null);
});

async function loadClient(t, endpoint, key) {
  const original = process.env.NEXT_PUBLIC_ENQUIRY_API_URL;
  process.env.NEXT_PUBLIC_ENQUIRY_API_URL = endpoint;
  t.after(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_ENQUIRY_API_URL;
    else process.env.NEXT_PUBLIC_ENQUIRY_API_URL = original;
  });
  return import(`../app/lib/enquiryClient.ts?case=${key}`);
}

test("invalid preview configuration never sends a request", async (t) => {
  const { submitEnquiry } = await loadClient(t, "https://enquiry-preview.invalid/enquiries", "invalid");
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected request"); });
  const result = await submitEnquiry({});
  assert.equal(result.code, "SERVICE_NOT_CONFIGURED");
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("browser network failure is distinct from an email service response", async (t) => {
  const { submitEnquiry } = await loadClient(t, "https://enquiries.example/enquiries", "network");
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });
  const result = await submitEnquiry({});
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(result.ok, false);
  assert.equal(result.code, "CLIENT_NETWORK_ERROR");
  assert.match(result.message, /reach our enquiry service/);
});

test("preserves a Worker email service error without relabelling it", async (t) => {
  const { submitEnquiry } = await loadClient(t, "https://enquiries.example/enquiries", "worker");
  const response = { ok: false, code: "SERVICE_UNAVAILABLE", message: "The server can’t connect to our email service right now." };
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify(response), {
    status: 503, headers: { "Content-Type": "application/json" },
  }));
  assert.deepEqual(await submitEnquiry({}), response);
});
