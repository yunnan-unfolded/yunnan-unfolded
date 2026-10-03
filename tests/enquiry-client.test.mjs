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
