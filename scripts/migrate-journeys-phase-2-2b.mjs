import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const legacyBasicKeys = [
  "collection",
  "listingDescription",
  "homepageDescription",
  "homepageImageAlt",
  "title",
  "subtitle",
  "heroEyebrow",
  "heroFacts",
  "promises",
  "inquiryEyebrow",
  "inquiryFacts",
  "inquiryPromise",
];

export function normalizeMigratedSlug(value = "") {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.json$/i, "")
    .replace(/^journeys(?:\/|-)+/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasMeaningfulValue(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (typeof value === "object") return Object.values(value).some(hasMeaningfulValue);
  return value !== false;
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => hasMeaningfulValue(entry)));
}

export function migrateJourneyDocument(source) {
  const document = structuredClone(source);
  const legacyBasic = { ...(document.basic ?? {}) };
  const title = String(document.title || legacyBasic.collection || legacyBasic.title || "").trim();
  const summary = String(document.summary || legacyBasic.listingDescription || legacyBasic.subtitle || "").trim();
  const advanced = { ...(document.advanced ?? {}) };

  if (!document.title) document.title = title;
  if (!document.summary) document.summary = summary;

  const { enabled: copyWasEnabled, ...existingCopy } = advanced.copy ?? {};
  const copyValues = compactObject({
    ...existingCopy,
    pageTitle: advanced.copy?.pageTitle || (legacyBasic.title && legacyBasic.title !== title ? legacyBasic.title : undefined),
    pageSubtitle: advanced.copy?.pageSubtitle || (legacyBasic.subtitle && legacyBasic.subtitle !== summary ? legacyBasic.subtitle : undefined),
    homepageDescription: advanced.copy?.homepageDescription || (legacyBasic.homepageDescription && legacyBasic.homepageDescription !== summary ? legacyBasic.homepageDescription : undefined),
    homepageImageAlt: advanced.copy?.homepageImageAlt || legacyBasic.homepageImageAlt,
  });
  advanced.copy = { ...copyValues, enabled: Boolean(copyWasEnabled || Object.keys(copyValues).length > 0) };

  const { enabled: heroWasEnabled, ...existingHero } = advanced.hero ?? {};
  const heroValues = compactObject({
    ...existingHero,
    eyebrow: advanced.hero?.eyebrow || legacyBasic.heroEyebrow,
    facts: advanced.hero?.facts?.length ? advanced.hero.facts : legacyBasic.heroFacts,
    imageAlt: advanced.hero?.imageAlt || document.hero?.alt,
  });
  advanced.hero = { ...heroValues, enabled: Boolean(heroWasEnabled || Object.keys(heroValues).length > 0) };

  const legacyFinalCta = document.overview?.finalCta;
  const existingInquiry = { ...(advanced.inquiry ?? {}) };
  delete existingInquiry.enabled;
  const inquiryValues = compactObject({
    ...existingInquiry,
    promises: advanced.inquiry?.promises?.length ? advanced.inquiry.promises : legacyBasic.promises,
    eyebrow: advanced.inquiry?.eyebrow || legacyBasic.inquiryEyebrow,
    facts: advanced.inquiry?.facts?.length ? advanced.inquiry.facts : legacyBasic.inquiryFacts,
    promise: advanced.inquiry?.promise || legacyBasic.inquiryPromise,
    finalCta: advanced.inquiry?.finalCta || legacyFinalCta,
  });
  advanced.inquiry = { ...inquiryValues, enabled: Boolean(Object.keys(inquiryValues).length > 0) };

  for (const key of legacyBasicKeys) delete legacyBasic[key];
  legacyBasic.slug = normalizeMigratedSlug(legacyBasic.slug || title);
  document.basic = legacyBasic;

  if (document.hero) delete document.hero.alt;
  if (document.overview) delete document.overview.finalCta;

  const legacyHighlightImages = document.highlights?.images;
  document.gallery = {
    ...(document.gallery ?? {}),
    images: (document.gallery?.images?.length ? document.gallery.images : (legacyHighlightImages ?? []))
      .filter((image) => typeof image?.src === "string" && image.src.trim()),
  };
  if (document.highlights) delete document.highlights.images;
  document.advanced = advanced;

  const ordered = {
    title: document.title,
    summary: document.summary,
    ...Object.fromEntries(Object.entries(document).filter(([key]) => key !== "title" && key !== "summary" && key !== "advanced")),
    advanced: document.advanced,
  };
  return ordered;
}

export function migrateJourneyDirectory(directory) {
  const oldDraft = join(directory, "journeys-yunnan-rhododendron-hiking.json");
  const renamedDraft = join(directory, "yunnan-rhododendron-hiking.json");
  if (existsSync(oldDraft)) {
    if (existsSync(renamedDraft)) throw new Error(`迁移停止：${basename(oldDraft)} 与 ${basename(renamedDraft)} 同时存在，未覆盖任何文件。`);
    renameSync(oldDraft, renamedDraft);
  }

  const changed = [];
  for (const filename of readdirSync(directory).filter((entry) => entry.endsWith(".json")).sort()) {
    const path = join(directory, filename);
    const before = readFileSync(path, "utf8");
    const migrated = migrateJourneyDocument(JSON.parse(before));
    const after = `${JSON.stringify(migrated, null, 2)}\n`;
    if (before !== after) {
      writeFileSync(path, after, "utf8");
      changed.push(filename);
    }
  }
  return changed;
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const projectRoot = dirname(dirname(scriptPath));
  const changed = migrateJourneyDirectory(join(projectRoot, "content", "journeys"));
  console.log(changed.length > 0 ? `Migrated: ${changed.join(", ")}` : "Journey migration already up to date.");
}
