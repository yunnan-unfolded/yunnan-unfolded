import { useState, type ChangeEvent, type FocusEvent } from "react";
import { useForm, useFormState } from "react-final-form";
import type { TinaField } from "tinacms";
import { normalizeJourneySlug } from "../../shared/journeyDefaults";

type FieldProps = {
  input: {
    name: string;
    value?: string;
    onChange: (event: ChangeEvent<string>) => void;
    onBlur: (event?: FocusEvent<string>) => void;
    onFocus: (event?: FocusEvent<string>) => void;
  };
  field: TinaField & { namespace: string[] };
  meta: { error?: unknown; touched?: boolean };
};

type JourneyValues = {
  title?: string;
  basic?: { slug?: string };
  hero?: { src?: string };
  itinerary?: { days?: unknown[] };
};

const buttonBase = {
  borderRadius: "0.4rem",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.85rem",
  fontWeight: 650,
  minHeight: "2.6rem",
  padding: "0.65rem 1rem",
} as const;

export function PublicationStatusField({ input, field, meta }: FieldProps) {
  const form = useForm();
  const { dirty, values, submitting } = useFormState<JourneyValues>({ subscription: { dirty: true, values: true, submitting: true } });
  const [message, setMessage] = useState("");
  const isPublished = input.value === "published";
  const title = values.title?.trim() || "尚未填写路线名称";
  const days = values.itinerary?.days?.length ?? 0;
  const hasHero = Boolean(values.hero?.src);
  const slug = values.basic?.slug?.trim() || "保存时自动生成";
  const previewSlug = normalizeJourneySlug(values.basic?.slug || values.title || "");
  const localPreviewAvailable = typeof window !== "undefined"
    && ["127.0.0.1", "localhost"].includes(window.location.hostname);

  function openDraftPreview() {
    if (!localPreviewAvailable) {
      setMessage("草稿预览仅在本地编辑环境中开放，正式网站不会生成草稿页面。");
      return;
    }
    if (dirty) {
      setMessage("请先保存草稿，再打开预览，确保预览显示刚刚保存的内容。");
      return;
    }
    if (!previewSlug) {
      setMessage("请先填写路线名称并保存草稿，系统才能生成预览地址。");
      return;
    }
    window.open(`/journeys/${previewSlug}/`, "_blank", "noopener,noreferrer");
    setMessage("草稿预览已在新标签页打开。该页面只在本地开发环境可用。");
  }

  async function submitAs(status: "draft" | "published") {
    if (submitting) return;

    if (status === "published") {
      const confirmed = window.confirm(
        `请确认发布信息：\n\n路线：${title}\n天数：${days} 天\n首图：${hasHero ? "已设置" : "未设置"}\n页面网址：${slug}\n\n确认发布到网站吗？`,
      );
      if (!confirmed) return;
    } else if (isPublished) {
      const confirmed = window.confirm("确认将这条已发布路线改为草稿吗？网站访客将看不到它。");
      if (!confirmed) return;
    }

    input.onChange(status as unknown as ChangeEvent<string>);
    form.change(input.name, status);
    setMessage("");
    try {
      const result = await form.submit();
      setMessage(result
        ? "保存失败：内容尚未保存。请查看页面上的中文提示，修正后再次保存。"
        : status === "published" ? "已发布内容已更新" : "草稿已保存" );
    } catch {
      setMessage("保存失败：内容尚未保存。请查看页面上的中文提示，修正后再次保存。");
    }
  }

  return (
    <section style={{ background: "#f7f4ec", border: "1px solid #ddd5c2", borderRadius: "0.55rem", marginBottom: "1.25rem", padding: "1rem" }}>
      <p style={{ color: "#26382e", fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>
        当前状态：{isPublished ? "已发布" : "草稿"}
      </p>
      <p style={{ color: "#5e6b63", fontSize: "0.78rem", lineHeight: 1.55, margin: "0.35rem 0 0" }}>
        {isPublished ? "网站访客可以看到这条路线。修改内容后请使用“更新已发布内容”。" : "网站访客看不到草稿。您可以反复保存，准备好后再发布。"}
      </p>

      <dl style={{ display: "grid", gap: "0.35rem", gridTemplateColumns: "auto 1fr", margin: "0.9rem 0", fontSize: "0.76rem" }}>
        <dt style={{ color: "#718077" }}>路线</dt><dd style={{ color: "#26382e", margin: 0 }}>{title}</dd>
        <dt style={{ color: "#718077" }}>天数</dt><dd style={{ color: "#26382e", margin: 0 }}>{days ? `${days} 天` : "尚未添加"}</dd>
        <dt style={{ color: "#718077" }}>首图</dt><dd style={{ color: "#26382e", margin: 0 }}>{hasHero ? "已设置" : "尚未设置"}</dd>
        <dt style={{ color: "#718077" }}>页面网址</dt><dd style={{ color: "#26382e", margin: 0, overflowWrap: "anywhere" }}>{slug}</dd>
      </dl>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
        {!isPublished ? (
          <>
            <button disabled={submitting} onClick={() => void submitAs("draft")} style={{ ...buttonBase, background: "#fff", border: "1px solid #355542", color: "#355542" }} type="button">
              保存草稿
            </button>
            <button disabled={submitting} onClick={() => void submitAs("published")} style={{ ...buttonBase, background: "#355542", border: "1px solid #355542", color: "#fff" }} type="button">
              发布行程
            </button>
            <button disabled={submitting} onClick={openDraftPreview} style={{ ...buttonBase, background: "#f5efe3", border: "1px solid #b69a62", color: "#5d4b2d" }} type="button">
              预览草稿
            </button>
          </>
        ) : (
          <>
            <button disabled={submitting} onClick={() => void submitAs("published")} style={{ ...buttonBase, background: "#355542", border: "1px solid #355542", color: "#fff" }} type="button">
              更新已发布内容
            </button>
            <button disabled={submitting} onClick={() => void submitAs("draft")} style={{ ...buttonBase, background: "transparent", border: "1px solid #b5aa91", color: "#5b584f" }} type="button">
              转为草稿
            </button>
          </>
        )}
      </div>
      {!localPreviewAvailable && !isPublished ? (
        <p style={{ color: "#718077", fontSize: "0.72rem", lineHeight: 1.5, margin: "0.7rem 0 0" }}>草稿预览按钮仅在本地编辑环境显示；正式部署不会公开草稿。</p>
      ) : null}
      <p aria-live="polite" style={{ color: "#4e6557", fontSize: "0.76rem", margin: message ? "0.75rem 0 0" : 0 }}>
        {message}
      </p>
      {meta.touched && meta.error ? <p style={{ color: "#b42318", fontSize: "0.76rem", marginBottom: 0 }}>{String(meta.error)}</p> : null}
      {field.description ? <p style={{ color: "#718077", fontSize: "0.72rem", lineHeight: 1.5, margin: "0.75rem 0 0" }}>{field.description}</p> : null}
    </section>
  );
}
