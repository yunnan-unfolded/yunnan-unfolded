import { notFound } from "next/navigation";
import { ArrowLink } from "../components/ArrowLink";
import { Header } from "../components/Header";

const pages: Record<string, { title: string; copy: string }> = {
  journeys: { title: "Journeys", copy: "Our full collection of thoughtful journeys through Yunnan is taking shape. This route is ready for the next phase." },
  "walk-yunnan": { title: "Walk Yunnan", copy: "A collection of mountain trails, quiet paths and journeys designed to be experienced on foot is coming next." },
  "travel-guides": { title: "Travel Guides", copy: "Field notes, practical guidance and stories from across Yunnan will live here." },
  about: { title: "About", copy: "The story of Yunnan Unfolded, our local perspective and Chloe’s approach to thoughtful travel will be shared here." },
  "plan-my-trip": { title: "Plan My Trip", copy: "A considered two-step inquiry experience will be created in Phase 2. For now, begin the conversation by email." },
};

export function generateStaticParams() { return Object.keys(pages).map((slug) => ({ slug })); }

export default async function PlaceholderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];

  if (!page) notFound();

  return <main className="placeholder"><Header /><div className="placeholder__inner shell"><p className="eyebrow">Yunnan Unfolded</p><h1>{page.title}</h1><p>{page.copy}</p>{slug === "plan-my-trip" ? <ArrowLink href="mailto:hello@yunnanunfolded.com">Email Chloe</ArrowLink> : <ArrowLink href="/">Return home</ArrowLink>}</div></main>;
}
