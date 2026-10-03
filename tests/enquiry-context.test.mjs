import assert from "node:assert/strict";
import test from "node:test";
import { addEnquiryContextToNotes, getEnquiryContext } from "../app/lib/enquiryContext.ts";

test("keeps Journey detail context in a readable form", () => {
  assert.equal(
    getEnquiryContext("?source=journey-detail&journey=Yunnan%20Slowly"),
    "Journey: Yunnan Slowly",
  );
});

test("turns Travel Guide slugs into readable titles", () => {
  assert.equal(
    getEnquiryContext("?source=travel-guide&guide=how-to-pay-in-yunnan"),
    "Travel guide: How to Pay in Yunnan",
  );
});

test("keeps walk detail context in a readable form", () => {
  assert.equal(
    getEnquiryContext("?source=walk&walk=luoguqing-rhododendron-walk&intent=plan"),
    "Walk: Luoguqing Rhododendron Walk",
  );
});

test("ignores unrelated or incomplete query parameters", () => {
  assert.equal(getEnquiryContext("?source=travel-guide"), "");
  assert.equal(getEnquiryContext("?source=walk"), "");
  assert.equal(getEnquiryContext("?source=other&journey=Yunnan"), "");
});

test("preserves customer notes and safely bounds referral text", () => {
  const context = getEnquiryContext(`?source=journey-detail&journey=${"a".repeat(200)}`);
  const notes = addEnquiryContextToNotes("  We enjoy slow walks.  ", context);

  assert.ok(context.length <= "Journey: ".length + 120);
  assert.ok(notes.startsWith(`I came to this enquiry from ${context}.`));
  assert.ok(notes.endsWith("We enjoy slow walks."));
});

test("leaves notes unchanged when there is no referral context", () => {
  assert.equal(addEnquiryContextToNotes("  A quiet journey, please.  ", ""), "A quiet journey, please.");
});
