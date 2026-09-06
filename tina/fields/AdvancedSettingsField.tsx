import type { ChangeEvent, CSSProperties, FocusEvent } from "react";
import { useField, useForm, useFormState } from "react-final-form";
import type { TinaField } from "tinacms";
import { JourneyImageField } from "./JourneyImageField";

type FieldProps = {
  input: {
    name: string;
    value?: Record<string, unknown>;
    onChange: (event: ChangeEvent<Record<string, unknown>>) => void;
    onBlur: (event?: FocusEvent<Record<string, unknown>>) => void;
    onFocus: (event?: FocusEvent<Record<string, unknown>>) => void;
  };
  field: TinaField & { namespace: string[] };
  meta: { error?: unknown; touched?: boolean };
};

type JourneyValues = {
  advanced?: {
    copy?: { enabled?: boolean; pageTitle?: string; pageSubtitle?: string; homepageDescription?: string; homepageImageAlt?: string };
    hero?: { enabled?: boolean; eyebrow?: string; facts?: string[]; imageAlt?: string };
    inquiry?: {
      enabled?: boolean;
      promises?: string[];
      eyebrow?: string;
      facts?: Array<{ label?: string; value?: string }>;
      promise?: string;
      finalCta?: { eyebrow?: string; title?: string; body?: string; primaryLabel?: string; secondaryLabel?: string };
    };
  };
  basic?: { slug?: string; searchKeywords?: string[]; travelStyle?: string; durationNights?: number };
  booking?: { conditions?: string[] };
  route?: { stops?: Array<{ place?: string; days?: string }> };
  seo?: { title?: string; description?: string; keywords?: string[] };
};

const controlStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: "0.4rem",
  color: "#26382e",
  font: "inherit",
  fontSize: "0.82rem",
  minHeight: "2.55rem",
  padding: "0.6rem 0.7rem",
  width: "100%",
};

function cleanLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function AdvancedText({ label, multiline = false, onChange, value }: { label: string; multiline?: boolean; onChange: (value: string) => void; value?: string }) {
  return (
    <label style={{ color: "#526158", display: "grid", fontSize: "0.73rem", fontWeight: 600, gap: "0.3rem" }}>
      {label}
      {multiline ? <textarea onChange={(event) => onChange(event.target.value)} rows={4} style={{ ...controlStyle, lineHeight: 1.5, resize: "vertical" }} value={value ?? ""} /> : <input onChange={(event) => onChange(event.target.value)} style={controlStyle} value={value ?? ""} />}
    </label>
  );
}

function OgImageControl() {
  const { input, meta } = useField<string>("seo.ogImage.src", { subscription: { value: true, error: true, touched: true } });
  return (
    <JourneyImageField
      field={{ type: "image", name: "src", label: "OG 分享图片", description: "留空时自动使用 Hero 图片。", namespace: ["journey", "seo", "ogImage", "src"] } as TinaField & { namespace: string[] }}
      input={input as never}
      meta={meta}
    />
  );
}

export function AdvancedSettingsField({ meta }: FieldProps) {
  const form = useForm();
  const { values } = useFormState<JourneyValues>({ subscription: { values: true } });
  const advanced = values.advanced ?? {};
  const copy = advanced.copy ?? {};
  const hero = advanced.hero ?? {};
  const inquiry = advanced.inquiry ?? {};
  const finalCta = inquiry.finalCta ?? {};
  const basic = values.basic ?? {};
  const seo = values.seo ?? {};
  const setValue = (path: string, value: unknown) => form.change(path, value);
  const routeStops = (values.route?.stops ?? []).map((stop) => [stop.place, stop.days].filter(Boolean).join(" | ")).join("\n");
  const inquiryFacts = (inquiry.facts ?? []).map((fact) => [fact.label, fact.value].filter(Boolean).join(" | ")).join("\n");

  return (
    <details style={{ background: "#f7f4ec", border: "1px solid #ddd5c2", borderRadius: "0.55rem", marginBottom: "1.25rem", padding: "0.9rem" }}>
      <summary style={{ color: "#26382e", cursor: "pointer", fontSize: "0.88rem", fontWeight: 750 }}>
        9. 高级设置（通常无需修改）
      </summary>
      <p style={{ color: "#718077", fontSize: "0.72rem", lineHeight: 1.55 }}>
        页面网址、搜索展示和品牌文案会自动生成。只有确实需要单独覆盖时才调整这里的内容。
      </p>

      <div style={{ display: "grid", gap: "0.8rem" }}>
        <AdvancedText label="自定义页面网址" onChange={(value) => setValue("basic.slug", value)} value={basic.slug} />
        <AdvancedText label="旅行方式（英文）" onChange={(value) => setValue("basic.travelStyle", value)} value={basic.travelStyle} />
        <AdvancedText label="住宿晚数" onChange={(value) => setValue("basic.durationNights", Number.parseInt(value, 10) || 0)} value={String(basic.durationNights ?? "")} />
        <AdvancedText label="后台搜索关键词（每行一个，中英文均可）" multiline onChange={(value) => setValue("basic.searchKeywords", cleanLines(value))} value={(basic.searchKeywords ?? []).join("\n")} />

        <details style={{ borderTop: "1px solid #ded8ca", paddingTop: "0.75rem" }}>
          <summary style={{ color: "#53655a", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700 }}>自定义页面文字</summary>
          <label style={{ alignItems: "center", color: "#526158", display: "flex", fontSize: "0.74rem", gap: "0.45rem", margin: "0.65rem 0" }}>
            <input checked={Boolean(copy.enabled)} onChange={(event) => setValue("advanced.copy.enabled", event.target.checked)} type="checkbox" />
            使用本路线自定义页面文字
          </label>
          {copy.enabled ? <div style={{ display: "grid", gap: "0.65rem" }}>
            <AdvancedText label="自定义页面 H1（英文）" onChange={(value) => setValue("advanced.copy.pageTitle", value)} value={copy.pageTitle} />
            <AdvancedText label="自定义页面副标题（英文）" multiline onChange={(value) => setValue("advanced.copy.pageSubtitle", value)} value={copy.pageSubtitle} />
            <AdvancedText label="自定义首页卡片简介（英文）" multiline onChange={(value) => setValue("advanced.copy.homepageDescription", value)} value={copy.homepageDescription} />
            <AdvancedText label="首页图片英文说明" multiline onChange={(value) => setValue("advanced.copy.homepageImageAlt", value)} value={copy.homepageImageAlt} />
          </div> : null}
        </details>

        <details style={{ borderTop: "1px solid #ded8ca", paddingTop: "0.75rem" }}>
          <summary style={{ color: "#53655a", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700 }}>Hero 自定义</summary>
          <label style={{ alignItems: "center", color: "#526158", display: "flex", fontSize: "0.74rem", gap: "0.45rem", margin: "0.65rem 0" }}>
            <input checked={Boolean(hero.enabled)} onChange={(event) => setValue("advanced.hero.enabled", event.target.checked)} type="checkbox" />
            使用本路线自定义 Hero 文字
          </label>
          {hero.enabled ? <div style={{ display: "grid", gap: "0.65rem" }}>
            <AdvancedText label="首图上方短标题（英文）" onChange={(value) => setValue("advanced.hero.eyebrow", value)} value={hero.eyebrow} />
            <AdvancedText label="首图关键词（每行一条）" multiline onChange={(value) => setValue("advanced.hero.facts", cleanLines(value))} value={(hero.facts ?? []).join("\n")} />
            <AdvancedText label="Hero 图片英文说明（SEO/无障碍）" multiline onChange={(value) => setValue("advanced.hero.imageAlt", value)} value={hero.imageAlt} />
          </div> : null}
        </details>

        <details style={{ borderTop: "1px solid #ded8ca", paddingTop: "0.75rem" }}>
          <summary style={{ color: "#53655a", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700 }}>自定义询盘文案</summary>
          <label style={{ alignItems: "center", color: "#526158", display: "flex", fontSize: "0.74rem", gap: "0.45rem", margin: "0.65rem 0" }}>
            <input checked={Boolean(inquiry.enabled)} onChange={(event) => setValue("advanced.inquiry.enabled", event.target.checked)} type="checkbox" />
            使用本路线自定义询盘文案
          </label>
          {inquiry.enabled ? <div style={{ display: "grid", gap: "0.65rem" }}>
            <AdvancedText label="服务承诺（每行一条）" multiline onChange={(value) => setValue("advanced.inquiry.promises", cleanLines(value))} value={(inquiry.promises ?? []).join("\n")} />
            <AdvancedText label="询盘卡短标题（英文）" onChange={(value) => setValue("advanced.inquiry.eyebrow", value)} value={inquiry.eyebrow} />
            <AdvancedText label="询盘卡信息（每行：名称 | 内容）" multiline onChange={(value) => setValue("advanced.inquiry.facts", cleanLines(value).map((line) => { const [label, ...rest] = line.split("|"); return { label: label.trim(), value: rest.join("|").trim() }; }).filter((fact) => fact.label && fact.value))} value={inquiryFacts} />
            <AdvancedText label="回复说明（英文）" onChange={(value) => setValue("advanced.inquiry.promise", value)} value={inquiry.promise} />
            <AdvancedText label="结尾短标题（英文）" onChange={(value) => setValue("advanced.inquiry.finalCta.eyebrow", value)} value={finalCta.eyebrow} />
            <AdvancedText label="结尾主标题（英文）" onChange={(value) => setValue("advanced.inquiry.finalCta.title", value)} value={finalCta.title} />
            <AdvancedText label="结尾正文（英文）" multiline onChange={(value) => setValue("advanced.inquiry.finalCta.body", value)} value={finalCta.body} />
            <AdvancedText label="主要按钮文字（英文）" onChange={(value) => setValue("advanced.inquiry.finalCta.primaryLabel", value)} value={finalCta.primaryLabel} />
            <AdvancedText label="次要按钮文字（英文）" onChange={(value) => setValue("advanced.inquiry.finalCta.secondaryLabel", value)} value={finalCta.secondaryLabel} />
          </div> : null}
        </details>

        <details style={{ borderTop: "1px solid #ded8ca", paddingTop: "0.75rem" }}>
          <summary style={{ color: "#53655a", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700 }}>路线节点与预订条件</summary>
          <div style={{ display: "grid", gap: "0.65rem", marginTop: "0.65rem" }}>
            <AdvancedText label="路线节点（每行：地点 | 天数）" multiline onChange={(value) => setValue("route.stops", cleanLines(value).map((line) => { const [place, ...rest] = line.split("|"); return { place: place.trim(), days: rest.join("|").trim() }; }).filter((stop) => stop.place))} value={routeStops} />
            <AdvancedText label="预订条件（每行一条）" multiline onChange={(value) => setValue("booking.conditions", cleanLines(value))} value={(values.booking?.conditions ?? []).join("\n")} />
          </div>
        </details>

        <details style={{ borderTop: "1px solid #ded8ca", paddingTop: "0.75rem" }}>
          <summary style={{ color: "#53655a", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700 }}>搜索展示设置——通常无需修改</summary>
          <p style={{ color: "#718077", fontSize: "0.7rem", lineHeight: 1.5 }}>标题、描述、Canonical、OG URL 和 Sitemap 均会自动生成。这里只填写确实需要覆盖的内容。</p>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            <AdvancedText label="SEO Title（建议不超过约60个英文字符）" onChange={(value) => setValue("seo.title", value)} value={seo.title} />
            <AdvancedText label="Meta description（建议约140–160个英文字符）" multiline onChange={(value) => setValue("seo.description", value)} value={seo.description} />
            <AdvancedText label="SEO keywords（每行一个）" multiline onChange={(value) => setValue("seo.keywords", cleanLines(value))} value={(seo.keywords ?? []).join("\n")} />
            <OgImageControl />
          </div>
        </details>
      </div>

      {meta.touched && meta.error ? <p style={{ color: "#b42318", fontSize: "0.75rem" }}>{String(meta.error)}</p> : null}
    </details>
  );
}
