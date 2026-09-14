import { useCallback } from "react";
import type { ChangeEvent, CSSProperties, FocusEvent } from "react";
import { useField, useForm, useFormState } from "react-final-form";
import { useCMS } from "tinacms";
import type { TinaField } from "tinacms";
import { normalizeWalkLines, normalizeWalkSlug } from "../../shared/walkDefaults";
import { getWalkSlugValidationError, type WalkSaveForm } from "../walkSave";

type FieldProps = {
  input: {
    name: string;
    value?: string;
    onChange: (event: ChangeEvent<string> | string) => void;
    onBlur: (event?: FocusEvent<string>) => void;
    onFocus: (event?: FocusEvent<string>) => void;
  };
  field: TinaField & { namespace: string[] };
  meta: { error?: unknown; touched?: boolean };
};

type WalkValues = {
  title?: string;
  basic?: {
    slug?: string;
    region?: string;
    summary?: string;
    difficulty?: string;
    approximateDuration?: string;
    recommendedSeasons?: string;
    searchKeywords?: string[];
  };
  seo?: { title?: string; description?: string };
  _sys?: { filename?: string; path?: string; relativePath?: string };
};

type TinaFormLike = {
  crudType?: "create" | "update";
  id?: unknown;
  path?: string;
  relativePath?: string;
  finalForm?: { getState?: () => { initialValues?: WalkValues } };
};

const inputStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: "0.4rem",
  color: "#26382e",
  font: "inherit",
  fontSize: "0.86rem",
  minHeight: "2.7rem",
  padding: "0.65rem 0.75rem",
  width: "100%",
};

const difficultyChoices = [
  { value: "gentle", label: "轻松步行", english: "Gentle Walk", help: "古镇、村落、湖边或轻松半日步行" },
  { value: "easy-moderate", label: "轻至中等", english: "Easy to Moderate", help: "森林、草甸和可调整的日间徒步" },
  { value: "high-country", label: "高地徒步", english: "High-Country Walking", help: "需要更多海拔、天气和路线准备" },
] as const;

function currentDocumentPathFromRoute() {
  if (typeof window === "undefined") return undefined;
  const match = window.location.hash.match(/^#\/collections\/edit\/walk\/(.+?)(?:\?.*)?$/);
  if (!match) return undefined;
  const relativePath = decodeURIComponent(match[1]).replace(/^~\//, "").replace(/\.json$/i, "");
  return relativePath ? `content/walks/${relativePath}.json` : undefined;
}

function getTinaSaveForm(
  cms: ReturnType<typeof useCMS>,
  finalForm: { getState: () => { initialValues?: unknown } },
): WalkSaveForm {
  const state = cms.state as unknown as { activeFormId?: string | null; forms?: Array<{ tinaForm?: TinaFormLike }> };
  const tinaForm = state.forms?.map((entry) => entry.tinaForm).find((entry) => entry?.id === state.activeFormId);
  const routePath = currentDocumentPathFromRoute();
  const rawInitialValues = tinaForm?.finalForm?.getState?.().initialValues
    ?? (finalForm.getState().initialValues as WalkValues | undefined);
  const initialValues = rawInitialValues ? {
    title: rawInitialValues.title,
    basic: { slug: rawInitialValues.basic?.slug },
    _sys: rawInitialValues._sys,
  } : undefined;

  return {
    crudType: tinaForm?.crudType ?? (routePath ? "update" : "create"),
    id: tinaForm?.id ?? routePath,
    path: tinaForm?.path ?? routePath,
    relativePath: tinaForm?.relativePath ?? routePath,
    getState: () => ({ initialValues }),
  };
}

function FieldLabel({ children, help, publishRequired = false }: { children: string; help?: string; publishRequired?: boolean }) {
  return (
    <label style={{ color: "#334155", display: "grid", fontSize: "0.82rem", fontWeight: 650, gap: "0.3rem" }}>
      <span>{children}{publishRequired ? "（发布必填）" : ""}</span>
      {help ? <small style={{ color: "#718077", fontSize: "0.72rem", fontWeight: 400, lineHeight: 1.45 }}>{help}</small> : null}
    </label>
  );
}

export function WalkBasicsField({ input }: FieldProps) {
  const cms = useCMS();
  const form = useForm();
  const { values } = useFormState<WalkValues>({ subscription: { values: true } });
  const validateTitle = useCallback(async (title: string, allValues: WalkValues) => {
    if (!title.trim() && !allValues.basic?.slug?.trim()) return undefined;
    const tinaClient = cms.api.tina;
    if (!tinaClient) return "后台连接尚未就绪，请稍后再试。";
    return getWalkSlugValidationError({
      cms: { api: { tina: { request: (query, options) => tinaClient.request(query, options) } } },
      form: getTinaSaveForm(cms, form),
      rawSlug: allValues.basic?.slug,
      title,
    });
  }, [cms, form]);
  const { input: titleInput, meta: titleMeta } = useField<string>(input.name, {
    subscription: { error: true, submitFailed: true, touched: true, validating: true, value: true },
    validate: validateTitle,
  });
  const basic = values.basic ?? {};
  const seo = values.seo ?? {};
  const setValue = (path: string, value: unknown) => form.change(path, value);
  const generatedSlug = normalizeWalkSlug(basic.slug || values.title || "new-walk") || "new-walk";

  return (
    <section style={{ background: "#fbfaf6", border: "1px solid #e1dccf", borderRadius: "0.65rem", marginBottom: "1.25rem", padding: "1.1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ color: "#26382e", fontSize: "1rem", fontWeight: 750, margin: 0 }}>1. 基本信息</p>
        <p style={{ color: "#647168", fontSize: "0.76rem", lineHeight: 1.55, margin: "0.3rem 0 0" }}>
          填写游客在路线列表中首先看到的信息。技术设置已收在页面底部，通常无需修改。
        </p>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <FieldLabel publishRequired>路线名称（英文）</FieldLabel>
        <input aria-label="路线名称（英文）" onBlur={titleInput.onBlur} onChange={(event) => titleInput.onChange(event.target.value)} onFocus={titleInput.onFocus} placeholder="A Walk through the Highland Meadows" style={inputStyle} value={titleInput.value ?? ""} />
        {titleMeta.validating ? <p style={{ color: "#647168", fontSize: "0.74rem", margin: "-0.55rem 0 0" }}>正在检查页面网址…</p> : null}
        {(titleMeta.touched || titleMeta.submitFailed) && titleMeta.error ? <p role="alert" style={{ color: "#b42318", fontSize: "0.76rem", margin: "-0.55rem 0 0" }}>{String(titleMeta.error)}</p> : null}

        <FieldLabel publishRequired>所在地区（英文）</FieldLabel>
        <input onChange={(event) => setValue("basic.region", event.target.value)} placeholder="North-west Yunnan" style={inputStyle} value={basic.region ?? ""} />

        <FieldLabel help="建议用一至两句话说明地点、景观和步行方式。" publishRequired>列表简短介绍（英文）</FieldLabel>
        <textarea onChange={(event) => setValue("basic.summary", event.target.value)} rows={4} style={{ ...inputStyle, lineHeight: 1.55, resize: "vertical" }} value={basic.summary ?? ""} />

        <fieldset style={{ border: 0, margin: 0, minWidth: 0, padding: 0 }}>
          <legend style={{ color: "#334155", fontSize: "0.82rem", fontWeight: 650, marginBottom: "0.6rem" }}>徒步难度（发布必填）</legend>
          <div role="radiogroup" style={{ display: "grid", gap: "0.55rem", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {difficultyChoices.map((choice) => {
              const selected = basic.difficulty === choice.value;
              return (
                <button aria-checked={selected} key={choice.value} onClick={() => setValue("basic.difficulty", choice.value)} role="radio" style={{ background: selected ? "#eef2eb" : "#fff", border: selected ? "2px solid #355542" : "1px solid #d7d9d4", borderRadius: "0.45rem", color: "#25362b", cursor: "pointer", font: "inherit", minHeight: "7rem", padding: "0.7rem 0.5rem" }} type="button">
                  <strong style={{ display: "block", fontSize: "0.8rem" }}>{choice.label}</strong>
                  <span style={{ color: "#526158", display: "block", fontSize: "0.7rem", marginTop: "0.25rem" }}>{choice.english}</span>
                  <span style={{ color: "#718077", display: "block", fontSize: "0.66rem", lineHeight: 1.4, marginTop: "0.4rem" }}>{choice.help}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <FieldLabel publishRequired>大约时长（英文）</FieldLabel>
            <input onChange={(event) => setValue("basic.approximateDuration", event.target.value)} placeholder="Half day" style={inputStyle} value={basic.approximateDuration ?? ""} />
          </div>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <FieldLabel publishRequired>推荐季节（英文）</FieldLabel>
            <input onChange={(event) => setValue("basic.recommendedSeasons", event.target.value)} placeholder="May to October" style={inputStyle} value={basic.recommendedSeasons ?? ""} />
          </div>
        </div>

        <details style={{ borderTop: "1px solid #ded8ca", paddingTop: "0.85rem" }}>
          <summary style={{ color: "#53655a", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>高级设置（通常无需修改）</summary>
          <p style={{ color: "#718077", fontSize: "0.7rem", lineHeight: 1.5 }}>页面网址和基础搜索标题会自动生成。只有确实需要单独覆盖时才修改。</p>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <FieldLabel help={`保存后的文件名：${generatedSlug}.json`}>页面网址</FieldLabel>
            <input onChange={(event) => setValue("basic.slug", event.target.value)} placeholder={generatedSlug} style={inputStyle} value={basic.slug ?? ""} />
            <FieldLabel help="建议不超过约 60 个英文字符。留空时使用路线名称。">SEO 标题（英文，可选）</FieldLabel>
            <input onChange={(event) => setValue("seo.title", event.target.value)} style={inputStyle} value={seo.title ?? ""} />
            <FieldLabel help="建议约 140–160 个英文字符。留空时使用列表简短介绍。">SEO 描述（英文，可选）</FieldLabel>
            <textarea onChange={(event) => setValue("seo.description", event.target.value)} rows={3} style={{ ...inputStyle, lineHeight: 1.5, resize: "vertical" }} value={seo.description ?? ""} />
            <FieldLabel help="只用于后台查找，不会显示在网站页面。每行一个，中英文均可。">后台搜索关键词</FieldLabel>
            <textarea onChange={(event) => setValue("basic.searchKeywords", normalizeWalkLines(event.target.value))} rows={5} style={{ ...inputStyle, lineHeight: 1.5, resize: "vertical" }} value={(basic.searchKeywords ?? []).join("\n")} />
          </div>
        </details>
      </div>
    </section>
  );
}
