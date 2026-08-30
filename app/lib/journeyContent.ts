import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { journeyContentToViewModel } from "./journeyAdapter";
import { assertValidJourneyCollection } from "./journeyValidation";
import type { JourneyContent } from "../types/journey";

const journeyDirectory = join(process.cwd(), "content", "journeys");

function readJourneyContents() {
  const entries = readdirSync(journeyDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      filename: entry.name,
      content: JSON.parse(readFileSync(join(journeyDirectory, entry.name), "utf8")) as JourneyContent,
    }));
  assertValidJourneyCollection(entries);
  return entries;
}

export const journeyContents = readJourneyContents();
export const publishedJourneys = journeyContents
  .filter(({ content }) => content.publication.status === "published")
  .map(({ content }) => journeyContentToViewModel(content));
export const journeys = publishedJourneys;

export function getJourneyBySlug(slug: string, includeDraft = false) {
  if (!includeDraft) return publishedJourneys.find((journey) => journey.slug === slug);
  const entry = journeyContents.find(({ content }) => content.basic.slug === slug);
  return entry ? journeyContentToViewModel(entry.content) : undefined;
}

export function getJourneyContentBySlug(slug: string) {
  return journeyContents.find(({ content }) => content.basic.slug === slug);
}
