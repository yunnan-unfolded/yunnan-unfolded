import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLink } from "../components/ArrowLink";
import { Header } from "../components/Header";

const pages: Record<string, { title: string; copy: string; description: string }> = {
  journeys: {
    title: "Journeys",
    copy: "Our full collection of thoughtful journeys through Yunnan is taking shape. This route is ready for the next phase.",
    description: "Explore thoughtful, locally rooted journeys through the mountains, cultures and quieter corners of Yunnan.",
  },
  "walk-yunnan": {
    title: "Walk Yunnan",
    copy: "A collection of mountain trails, quiet paths and journeys designed to be experienced on foot is coming next.",
    description: "Discover Yunnan on foot through mountain trails, high valleys, forests and village paths shaped by local knowledge.",
  },
  "travel-guides": {
    title: "Travel Guides",
    copy: "Field notes, practical guidance and stories from across Yunnan will live here.",
    description: "Read practical Yunnan travel guidance, field notes and local stories for planning a more thoughtful journey.",
  },
  about: {
    title: "About",
    copy: "The story of Yunnan Unfolded, our local perspective and Chloe’s approach to thoughtful travel will be shared here.",
    description: "Meet Yunnan Unfolded and discover the local perspective behind our thoughtful, tailor-made journeys through Yunnan.",
  },
  "plan-my-trip": {
    title: "Plan My Trip",
    copy: "A considered two-step inquiry experience will be created in Phase 2. For now, begin the conversation by email.",
    description: "Start planning a tailor-made Yunnan journey shaped around your time, interests, travel style and sense of discovery.",
  },
};

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];

  if (!page) return {};

  return {
    title: `${page.title} | Yunnan Unfolded`,
    description: page.description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: `${page.title} | Yunnan Unfolded`,
      description: page.description,
      url: `/${slug}`,
      siteName: "Yunnan Unfolded",
      type: "website",
    },
  };
}

export default async function PlaceholderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug];

  if (!page) notFound();

  return (
    <main className="placeholder">
      <Header />
      <div className="placeholder__inner shell">
        <p className="eyebrow">Yunnan Unfolded</p>
        <h1>{page.title}</h1>
        <p>{page.copy}</p>
        {slug === "plan-my-trip" ? (
          <ArrowLink href="mailto:hello@yunnanunfolded.com">Email Chloe</ArrowLink>
        ) : (
          <ArrowLink href="/">Return home</ArrowLink>
        )}
      </div>
    </main>
  );
}
