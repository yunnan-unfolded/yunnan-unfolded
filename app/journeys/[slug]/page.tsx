import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourProductPage } from "../../components/journeys/TourProductPage";
import { EditableTourProductPage } from "../../components/journeys/EditableTourProductPage";
import { getJourneyBySlug, getJourneyContentBySlug, journeyContents, publishedJourneys } from "../../lib/journeyContent";
import { absoluteAssetUrl, absolutePageUrl } from "../../lib/sitePaths";
import client from "../../../tina/__generated__/client";

type JourneyPageProps = { params: Promise<{ slug: string }> };
const localDraftPreviewEnabled = process.env.TINA_LOCAL_DRAFT_PREVIEW === "true";

export function generateStaticParams() {
  return localDraftPreviewEnabled
    ? journeyContents.map(({ content }) => ({ slug: content.basic.slug }))
    : publishedJourneys.map((journey) => ({ slug: journey.slug }));
}

export async function generateMetadata({ params }: JourneyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = getJourneyBySlug(slug, localDraftPreviewEnabled);
  if (!journey) return {};
  const contentEntry = getJourneyContentBySlug(slug);
  if (contentEntry?.content.publication.status !== "published") {
    return {
      title: { absolute: `${journey.title} — Local Draft Preview` },
      alternates: { canonical: null },
      robots: { index: false, follow: false },
    };
  }

  const pageUrl = absolutePageUrl(`/journeys/${journey.slug}`);
  const socialImage = journey.seo.ogImage ?? journey.hero;
  return {
    title: { absolute: journey.seo.title },
    description: journey.seo.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: journey.seo.title,
      description: journey.seo.description,
      url: pageUrl,
      siteName: "Yunnan Unfolded",
      type: "article",
      images: [{
        url: absoluteAssetUrl(socialImage.src),
        width: socialImage.width,
        height: socialImage.height,
        alt: socialImage.alt,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: journey.seo.title,
      description: journey.seo.description,
      images: [absoluteAssetUrl(socialImage.src)],
    },
  };
}

export default async function JourneyDetailPage({ params }: JourneyPageProps) {
  const { slug } = await params;
  const contentEntry = getJourneyContentBySlug(slug);
  const isPublished = contentEntry?.content.publication.status === "published";
  const journey = getJourneyBySlug(slug, localDraftPreviewEnabled);
  if (!journey) notFound();
  if (!isPublished && !localDraftPreviewEnabled) notFound();

  const pageUrl = absolutePageUrl(`/journeys/${journey.slug}`);
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absolutePageUrl("/") },
      { "@type": "ListItem", position: 2, name: "Journeys", item: absolutePageUrl("/journeys") },
      { "@type": "ListItem", position: 3, name: journey.collection, item: pageUrl },
    ],
  };
  const touristTripData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: journey.title,
    description: journey.seo.description,
    url: pageUrl,
    image: absoluteAssetUrl(journey.hero.src),
    provider: { "@type": "TravelAgency", name: "Yunnan Unfolded", url: absolutePageUrl("/") },
    touristType: journey.suitable,
    itinerary: {
      "@type": "ItemList",
      numberOfItems: journey.days.length,
      itemListElement: journey.days.map((day, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `Day ${day.day}: ${day.title}`,
        description: day.paragraphs.join(" "),
      })),
    },
  };

  const tinaPayload = contentEntry ? await client.queries.journey({ relativePath: contentEntry.filename }) : null;
  const publicTinaPayload = tinaPayload
    ? {
        ...tinaPayload,
        data: structuredClone(tinaPayload.data),
        query: tinaPayload.query.replace(/^\s*searchKeywords\s*$/gm, ""),
      }
    : null;
  if (publicTinaPayload) {
    delete (publicTinaPayload.data.journey.basic as { searchKeywords?: string[] }).searchKeywords;
  }

  return (
    <>
      {isPublished ? (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristTripData) }} />
        </>
      ) : null}
      {publicTinaPayload ? <EditableTourProductPage payload={publicTinaPayload} /> : <TourProductPage journey={journey} />}
    </>
  );
}
