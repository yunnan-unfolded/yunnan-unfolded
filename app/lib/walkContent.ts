import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { WalkContent } from "../types/walk.ts";
import { walkContentToDetail } from "./walkAdapter.ts";

const walkDirectory = join(process.cwd(), "content", "walks");

export type WalkContentEntry = { filename: string; content: WalkContent };

function readWalkContents(): WalkContentEntry[] {
  const entries = readdirSync(walkDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      filename: entry.name,
      content: JSON.parse(readFileSync(join(walkDirectory, entry.name), "utf8")) as WalkContent,
    }));

  const seenSlugs = new Set<string>();
  for (const entry of entries) {
    const slug = entry.content.basic.slug;
    if (!slug || entry.filename !== `${slug}.json`) {
      throw new Error(`Walk filename and slug must match: ${entry.filename}`);
    }
    if (seenSlugs.has(slug)) throw new Error(`Duplicate Walk slug: ${slug}`);
    seenSlugs.add(slug);
  }

  return entries;
}

export const walkContents = readWalkContents();
export const publishedWalks = walkContents
  .filter(({ content }) => content.publication.status === "published")
  .map(({ content }) => walkContentToDetail(content));

export function getWalkContentBySlug(slug: string, refreshFromDisk = false) {
  const contents = refreshFromDisk ? readWalkContents() : walkContents;
  return contents.find(({ content }) => content.basic.slug === slug);
}

export function getWalkBySlug(slug: string, includeDraft = false) {
  if (!includeDraft) return publishedWalks.find((walk) => walk.slug === slug);
  const entry = getWalkContentBySlug(slug, true);
  return entry ? walkContentToDetail(entry.content) : undefined;
}
