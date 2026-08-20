import { absolutePageUrl } from "../lib/sitePaths";

const homeUrl = absolutePageUrl("/");
const organizationId = `${homeUrl}#organization`;
const websiteId = `${homeUrl}#website`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: "Yunnan Unfolded",
      url: homeUrl,
      description:
        "Boutique, locally rooted journeys through the mountains, cultures and hidden corners of Yunnan, China.",
      founder: {
        "@type": "Person",
        name: "Chloe",
      },
      areaServed: {
        "@type": "AdministrativeArea",
        name: "Yunnan, China",
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: homeUrl,
      name: "Yunnan Unfolded",
      publisher: {
        "@id": organizationId,
      },
      inLanguage: "en",
    },
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
