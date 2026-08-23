import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const expectedTimingValues = [
  "Not sure yet",
  "January–March",
  "April–June",
  "July–September",
  "October–December",
];

const formFiles = [
  "app/components/QuickInquiryForm.tsx",
  "app/components/TripPlannerForm.tsx",
];

const sources = formFiles.map((file) => ({
  file,
  source: readFileSync(resolve(file), "utf8"),
}));

for (const { file, source } of sources) {
  const options = [...source.matchAll(/<option\b([^>]*)>([^<]*)<\/option>/g)];
  for (const [, attributes] of options) {
    assert.match(attributes, /\bvalue="[^"]+"/, `${file} contains an option without an explicit value.`);
  }
}

const quickSource = sources.find(({ file }) => file.endsWith("QuickInquiryForm.tsx")).source;
const quickOptions = [...quickSource.matchAll(/<option\s+value="([^"]+)">([^<]*)<\/option>/g)]
  .map(([, value, label]) => ({ value, label }));

assert.deepEqual(quickOptions.map(({ value }) => value), expectedTimingValues);

const translatedLabels = ["尚不确定", "一月至三月", "四月至六月", "七月至九月", "十月至十二月"];
const translatedOptions = quickOptions.map((option, index) => ({
  ...option,
  label: translatedLabels[index],
}));

assert.deepEqual(
  translatedOptions.map(({ value }) => value),
  expectedTimingValues,
  "Translating visible option labels must not alter submitted timing values.",
);

console.log("Enquiry form option value tests passed.");
