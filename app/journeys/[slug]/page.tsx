import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourProductPage } from "../../components/journeys/TourProductPage";
import { EditableTourProductPage } from "../../components/journeys/EditableTourProductPage";
import { getJourneyBySlug, getJourneyContentBySlug, publishedJourneys } from "../../lib/journeyContent";
import { absoluteAssetUrl, absolutePageUrl } from "../../lib/sitePaths";
import client from "../../../tina/__generated__/client";

type JourneyPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publishedJourneys.map((journey) => ({ slug: journey.slug }));
}

export async function generateMetadata({ params }: JourneyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = getJourneyBySlug(slug);
  if (!journey) return {};

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
  const journey = getJourneyBySlug(slug, true);
  if (!journey) notFound();

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

  const contentEntry = getJourneyContentBySlug(slug);
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristTripData) }} />
      {publicTinaPayload ? <EditableTourProductPage payload={publicTinaPayload} /> : <TourProductPage journey={journey} />}
    </>
  );
}
