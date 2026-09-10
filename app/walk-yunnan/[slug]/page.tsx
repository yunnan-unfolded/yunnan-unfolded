import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WalkDetailPage } from "../../components/walks/WalkDetailPage";
import { journeyContentToViewModel } from "../../lib/journeyAdapter";
import { journeyContents } from "../../lib/journeyContent";
import { relatedJourneyFilename } from "../../lib/walkAdapter";
import { getWalkBySlug, getWalkContentBySlug, publishedWalks, walkContents } from "../../lib/walkContent";
import { absoluteAssetUrl, absolutePageUrl } from "../../lib/sitePaths";

type WalkPageProps = { params: Promise<{ slug: string }> };
const localDraftPreviewEnabled = process.env.NODE_ENV === "development"
  && process.env.TINA_LOCAL_DRAFT_PREVIEW === "true";

export function generateStaticParams() {
  if (localDraftPreviewEnabled) {
    return walkContents.map(({ content }) => ({ slug: content.basic.slug }));
  }

  const publishedParams = publishedWalks.map((walk) => ({ slug: walk.slug }));
  return publishedParams.length > 0
    ? publishedParams
    : [{ slug: "__no-published-walks__" }];
}

export async function generateMetadata({ params }: WalkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const walk = getWalkBySlug(slug, localDraftPreviewEnabled);
  if (!walk) return {};

  if (walk.status !== "published") {
    return {
      title: { absolute: `${walk.title} — Local Draft Preview` },
      alternates: { canonical: null },
      robots: { index: false, follow: false },
    };
  }

  const pageUrl = absolutePageUrl(`/walk-yunnan/${walk.slug}`);
  const imageUrl = absoluteAssetUrl(walk.hero.src);
  return {
    title: { absolute: walk.seo.title },
    description: walk.seo.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: walk.seo.title,
      description: walk.seo.description,
      url: pageUrl,
      siteName: "Yunnan Unfolded",
      type: "article",
      images: [{
        url: imageUrl,
        width: walk.hero.width,
        height: walk.hero.height,
        alt: walk.hero.alt,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: walk.seo.title,
      description: walk.seo.description,
      images: [imageUrl],
    },
  };
}

export default async function WalkPage({ params }: WalkPageProps) {
  const { slug } = await params;
  const contentEntry = getWalkContentBySlug(slug, localDraftPreviewEnabled);
  const walk = getWalkBySlug(slug, localDraftPreviewEnabled);
  if (!contentEntry || !walk) notFound();
  if (walk.status !== "published" && !localDraftPreviewEnabled) notFound();

  const isPublished = walk.status === "published";
  const relatedFilename = relatedJourneyFilename(walk.relatedJourneyReference);
  const relatedEntry = relatedFilename
    ? journeyContents.find((journey) => journey.filename === relatedFilename)
    : undefined;
  const relatedJourney = relatedEntry ? journeyContentToViewModel(relatedEntry.content) : undefined;
  const pageUrl = absolutePageUrl(`/walk-yunnan/${walk.slug}`);
  const structuredData = isPublished ? [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absolutePageUrl("/") },
        { "@type": "ListItem", position: 2, name: "Walk Yunnan", item: absolutePageUrl("/walk-yunnan") },
        { "@type": "ListItem", position: 3, name: walk.title, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: walk.title,
      description: walk.seo.description,
      url: pageUrl,
      image: absoluteAssetUrl(walk.hero.src),
      author: { "@type": "Organization", name: "Yunnan Unfolded", url: absolutePageUrl("/") },
      publisher: { "@type": "Organization", name: "Yunnan Unfolded", url: absolutePageUrl("/") },
    },
  ] : [];

  return (
    <>
      {structuredData.map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <WalkDetailPage
        walk={walk}
        relatedJourney={relatedJourney}
        isLocalDraft={!isPublished}
      />
    </>
  );
}
