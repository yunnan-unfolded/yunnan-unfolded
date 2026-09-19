import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TravelGuideDetailPage } from "../../components/travel-guides/TravelGuideDetailPage";
import {
  getTravelGuideBySlug,
  getTravelGuideContentBySlug,
  publishedTravelGuides,
  travelGuideContents,
} from "../../lib/travelGuideContent";
import { buildTravelGuideMetadata, buildTravelGuideStructuredData } from "../../lib/travelGuideSeo";

type TravelGuidePageProps = { params: Promise<{ slug: string }> };
const localDraftPreviewEnabled = process.env.NODE_ENV === "development"
  && process.env.TINA_LOCAL_DRAFT_PREVIEW === "true";

export function generateStaticParams() {
  if (localDraftPreviewEnabled) {
    return travelGuideContents.map(({ content }) => ({ slug: content.basic.slug }));
  }

  const publishedParams = publishedTravelGuides.map((guide) => ({ slug: guide.slug }));
  return publishedParams.length > 0
    ? publishedParams
    : [{ slug: "__no-published-travel-guides__" }];
}

export async function generateMetadata({ params }: TravelGuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getTravelGuideBySlug(slug, localDraftPreviewEnabled);
  return guide ? buildTravelGuideMetadata(guide) : {};
}

export default async function TravelGuidePage({ params }: TravelGuidePageProps) {
  const { slug } = await params;
  const contentEntry = getTravelGuideContentBySlug(slug, localDraftPreviewEnabled);
  const guide = getTravelGuideBySlug(slug, localDraftPreviewEnabled);
  if (!contentEntry || !guide) notFound();
  if (guide.status !== "published" && !localDraftPreviewEnabled) notFound();

  const structuredData = buildTravelGuideStructuredData(guide);

  return (
    <>
      {structuredData.map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <TravelGuideDetailPage guide={guide} isLocalDraft={guide.status !== "published"} />
    </>
  );
}
