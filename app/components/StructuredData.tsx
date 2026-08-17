const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://yunnanunfolded.com/#organization",
      name: "Yunnan Unfolded",
      url: "https://yunnanunfolded.com",
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
      "@id": "https://yunnanunfolded.com/#website",
      url: "https://yunnanunfolded.com",
      name: "Yunnan Unfolded",
      publisher: {
        "@id": "https://yunnanunfolded.com/#organization",
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
