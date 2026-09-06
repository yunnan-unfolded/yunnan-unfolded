import { useCallback } from "react";
import type { ChangeEvent, CSSProperties, FocusEvent } from "react";
import { useField, useForm, useFormState } from "react-final-form";
import { useCMS } from "tinacms";
import type { TinaField } from "tinacms";
import { getJourneySlugValidationError } from "../journeySave";
import type { SaveForm } from "../journeySave";
import { JourneyImageField } from "./JourneyImageField";

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

type JourneyValues = {
  title?: string;
  summary?: string;
  basic?: {
    activityLevel?: string;
    bestSeasons?: string;
    durationDays?: number;
    endLocation?: string;
    priceNote?: string;
    startLocation?: string;
    slug?: string;
  };
  hero?: { src?: string };
  route?: { display?: string };
  _sys?: { filename?: string; path?: string; relativePath?: string };
};

type TinaFormLike = {
  crudType?: "create" | "update";
  id?: unknown;
  path?: string;
  relativePath?: string;
  finalForm?: { getState?: () => { initialValues?: JourneyValues } };
};

function currentDocumentPathFromRoute() {
  if (typeof window === "undefined") return undefined;
  const match = window.location.hash.match(/^#\/collections\/edit\/journey\/(.+?)(?:\?.*)?$/);
  if (!match) return undefined;
  const relativePath = decodeURIComponent(match[1]).replace(/^~\//, "").replace(/\.json$/i, "");
  return relativePath ? `content/journeys/${relativePath}.json` : undefined;
}

function getTinaSaveForm(
  cms: ReturnType<typeof useCMS>,
  finalForm: { getState: () => { initialValues?: unknown } },
): SaveForm {
  const state = cms.state as unknown as {
    activeFormId?: string | null;
    forms?: Array<{ tinaForm?: TinaFormLike }>;
  };
  const tinaForm = state.forms
    ?.map((entry) => entry.tinaForm)
    .find((entry) => entry?.id === state.activeFormId);
  const routePath = currentDocumentPathFromRoute();
  const rawInitialValues = tinaForm?.finalForm?.getState?.().initialValues
    ?? (finalForm.getState().initialValues as JourneyValues | undefined);
  const initialValues = rawInitialValues ? {
    title: rawInitialValues.title,
    basic: { slug: rawInitialValues.basic?.slug },
    _sys: rawInitialValues._sys,
  } : undefined;
  const crudType = tinaForm?.crudType
    ?? (routePath ? "update" : "create");

  return {
    crudType,
    id: tinaForm?.id ?? routePath,
    path: tinaForm?.path ?? routePath,
    relativePath: tinaForm?.relativePath ?? routePath,
    getState: () => ({ initialValues }),
  };
}

const inputStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: "0.4rem",
  color: "#26382e",
  font: "inherit",
  fontSize: "0.88rem",
  minHeight: "2.7rem",
  padding: "0.65rem 0.75rem",
  width: "100%",
};

function FieldLabel({ children, help, required = false }: { children: string; help?: string; required?: boolean }) {
  return (
    <label style={{ color: "#334155", display: "grid", fontSize: "0.82rem", fontWeight: 650, gap: "0.35rem" }}>
      <span>{children}{required ? "（必填）" : ""}</span>
      {help ? <small style={{ color: "#718077", fontSize: "0.72rem", fontWeight: 400, lineHeight: 1.45 }}>{help}</small> : null}
    </label>
  );
}

function HeroImageControl() {
  const { input, meta } = useField<string>("hero.src", { subscription: { value: true, error: true, touched: true } });
  return (
    <JourneyImageField
      field={{
        type: "image",
        name: "src",
        label: "Hero 图片",
        description: "选择或上传路线首图。图片尺寸和路径由系统自动处理。",
        namespace: ["journey", "hero", "src"],
      } as TinaField & { namespace: string[] }}
      input={input as never}
      meta={meta}
    />
  );
}

export function JourneyBasicsField({ input }: FieldProps) {
  const cms = useCMS();
  const form = useForm();
  const { values } = useFormState<JourneyValues>({ subscription: { values: true } });
  const validateTitle = useCallback(async (title: string, allValues: JourneyValues) => {
    const tinaClient = cms.api.tina;
    if (!tinaClient) return "后台连接尚未就绪，请稍后再试。";
    return getJourneySlugValidationError({
      cms: {
        api: { tina: { request: (query, options) => tinaClient.request(query, options) } },
      },
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
  const setValue = (path: string, value: string | number) => form.change(path, value);

  return (
    <section style={{ background: "#fbfaf6", border: "1px solid #e1dccf", borderRadius: "0.65rem", marginBottom: "1.25rem", padding: "1.1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ color: "#26382e", fontSize: "1rem", fontWeight: 750, margin: 0 }}>1. 基本信息</p>
        <p style={{ color: "#647168", fontSize: "0.76rem", lineHeight: 1.55, margin: "0.3rem 0 0" }}>
          先填写路线名称和简介。页面标题、列表卡片和基础搜索展示会自动使用这些内容。
        </p>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <FieldLabel required>路线名称（英文）</FieldLabel>
        <input
          aria-label="路线名称（英文）"
          onBlur={titleInput.onBlur}
          onChange={(event) => titleInput.onChange(event.target.value)}
          onFocus={titleInput.onFocus}
          placeholder="When the Mountains Bloom"
          style={inputStyle}
          value={titleInput.value ?? ""}
        />
        {titleMeta.validating ? <p style={{ color: "#647168", fontSize: "0.76rem", margin: "-0.55rem 0 0" }}>正在检查页面网址…</p> : null}
        {(titleMeta.touched || titleMeta.submitFailed) && titleMeta.error ? (
          <p role="alert" style={{ color: "#b42318", fontSize: "0.76rem", margin: "-0.55rem 0 0" }}>{String(titleMeta.error)}</p>
        ) : null}

        <FieldLabel help="页面副标题和所有路线卡片默认使用同一段简介。" required>路线简介（英文）</FieldLabel>
        <textarea
          aria-label="路线简介（英文）"
          onChange={(event) => setValue("summary", event.target.value)}
          placeholder="用一至两句话说明路线的地点、体验与旅行方式。"
          rows={4}
          style={{ ...inputStyle, lineHeight: 1.55, resize: "vertical" }}
          value={values.summary ?? ""}
        />

        <div style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <FieldLabel help="根据“每日行程”自动计算，无需手动修改。">天数</FieldLabel>
            <output style={{ ...inputStyle, alignItems: "center", background: "#f2f0e9", display: "flex" }}>
              {basic.durationDays ? `${basic.durationDays} 天` : "添加每日行程后自动计算"}
            </output>
          </div>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <FieldLabel>旅行季节（英文）</FieldLabel>
            <input onChange={(event) => setValue("basic.bestSeasons", event.target.value)} placeholder="May to July" style={inputStyle} value={basic.bestSeasons ?? ""} />
          </div>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <FieldLabel>难度（英文）</FieldLabel>
            <input onChange={(event) => setValue("basic.activityLevel", event.target.value)} placeholder="Easy to moderate" style={inputStyle} value={basic.activityLevel ?? ""} />
          </div>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <FieldLabel>起点（英文）</FieldLabel>
            <input onChange={(event) => setValue("basic.startLocation", event.target.value)} placeholder="Lijiang" style={inputStyle} value={basic.startLocation ?? ""} />
          </div>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <FieldLabel>终点（英文）</FieldLabel>
            <input onChange={(event) => setValue("basic.endLocation", event.target.value)} placeholder="Shaxi" style={inputStyle} value={basic.endLocation ?? ""} />
          </div>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <FieldLabel>价格说明（英文）</FieldLabel>
            <input onChange={(event) => setValue("basic.priceNote", event.target.value)} placeholder="Tailored quotation" style={inputStyle} value={basic.priceNote ?? ""} />
          </div>
        </div>

        <FieldLabel help="例如：Lijiang → Luoguqing → Shaxi。">路线概览（英文）</FieldLabel>
        <input onChange={(event) => setValue("route.display", event.target.value)} style={inputStyle} value={values.route?.display ?? ""} />

        <div style={{ borderTop: "1px solid #e1dccf", paddingTop: "1rem" }}>
          <FieldLabel help="只需选择图片；尺寸、比例和文件路径由系统处理。">Hero 图片</FieldLabel>
          <div style={{ marginTop: "0.5rem" }}><HeroImageControl /></div>
        </div>
      </div>
    </section>
  );
}
