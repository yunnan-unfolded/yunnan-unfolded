import type { TinaField } from "tinacms";

export function HomeCollectionHelp({ field }: { field: TinaField & { namespace: string[] } }) {
  const collection = field.name === "journeyCardsHelp" ? "journey"
    : field.name === "walkCardsHelp" ? "walk" : "travelGuide";
  const label = collection === "journey" ? "精品行程"
    : collection === "walk" ? "徒步路线" : "旅行攻略";
  return (
    <div style={{ width: "100%", minWidth: 0, maxWidth: "100%", boxSizing: "border-box", whiteSpace: "normal", overflowWrap: "anywhere", padding: "16px", border: "1px solid #e2e5eb", borderRadius: "6px" }}>
      <strong>{field.label}</strong>
      <p style={{ whiteSpace: "normal", overflowWrap: "anywhere", lineHeight: 1.6, margin: "8px 0" }}>{field.description}</p>
      <a href={`#/collections/${collection}`} style={{ color: "#2563eb", textDecoration: "underline" }}>打开「{label}」集合</a>
    </div>
  );
}
