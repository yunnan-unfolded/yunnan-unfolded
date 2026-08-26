import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourProductPage } from "../../components/journeys/TourProductPage";
import { getJourneyBySlug, publishedJourneys } from "../../data/journeys";
import { absoluteAssetUrl, absolutePageUrl } from "../../lib/sitePaths";

type JourneyPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

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
  const journey = getJourneyBySlug(slug);
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristTripData) }} />
      <TourProductPage journey={journey} />
    </>
  );
}
