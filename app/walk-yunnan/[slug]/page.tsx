import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WalkDetailPage } from "../../components/walks/WalkDetailPage";
import { journeyContentToViewModel } from "../../lib/journeyAdapter";
import { journeyContents } from "../../lib/journeyContent";
import { relatedJourneyFilename } from "../../lib/walkAdapter";
import { getWalkBySlug, getWalkContentBySlug, publishedWalks, walkContents } from "../../lib/walkContent";
import { buildWalkMetadata, buildWalkStructuredData } from "../../lib/walkSeo";

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
  return buildWalkMetadata(walk);
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
  const relatedJourney = relatedEntry
    && (relatedEntry.content.publication.status === "published" || localDraftPreviewEnabled)
    ? journeyContentToViewModel(relatedEntry.content)
    : undefined;
  const structuredData = buildWalkStructuredData(walk);

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
