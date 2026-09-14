import { useState, type ChangeEvent, type FocusEvent } from "react";
import { useForm, useFormState } from "react-final-form";
import type { TinaField } from "tinacms";
import { normalizeWalkSlug } from "../../shared/walkDefaults";

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

type WalkValues = {
  title?: string;
  basic?: { slug?: string; region?: string };
  hero?: { src?: string; alt?: string };
};

const buttonBase = {
  borderRadius: "0.4rem",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.84rem",
  fontWeight: 650,
  minHeight: "2.6rem",
  padding: "0.65rem 1rem",
} as const;

export function WalkPublicationStatusField({ input, field, meta }: FieldProps) {
  const form = useForm();
  const { dirty, submitting, values } = useFormState<WalkValues>({ subscription: { dirty: true, submitting: true, values: true } });
  const [message, setMessage] = useState("");
  const isPublished = input.value === "published";
  const title = values.title?.trim() || "尚未填写";
  const region = values.basic?.region?.trim() || "尚未填写";
  const slug = normalizeWalkSlug(values.basic?.slug || values.title || "new-walk") || "new-walk";
  const hasHero = Boolean(values.hero?.src && values.hero?.alt);

  async function submitAs(status: "draft" | "published") {
    if (submitting) return;
    if (status === "published") {
      const confirmed = window.confirm(`请确认发布信息：\n\n路线：${title}\n地区：${region}\n首图及英文说明：${hasHero ? "已设置" : "未完成"}\n页面网址：${slug}\n\n确认发布这条徒步路线吗？`);
      if (!confirmed) return;
    } else if (isPublished) {
      const confirmed = window.confirm("确认将这条徒步路线改为草稿吗？网站访客将看不到它。");
      if (!confirmed) return;
    }

    input.onChange(status as unknown as ChangeEvent<string>);
    form.change(input.name, status);
    setMessage("");
    try {
      const result = await form.submit();
      setMessage(result
        ? "保存失败：内容尚未保存。请查看页面中的中文提示。"
        : status === "published" ? (isPublished ? "已发布内容已更新" : "徒步路线已发布") : "草稿已保存");
    } catch {
      setMessage("保存失败：内容尚未保存。请查看页面中的中文提示。");
    }
  }

  return (
    <section style={{ background: "#f7f4ec", border: "1px solid #ddd5c2", borderRadius: "0.55rem", marginBottom: "1.25rem", padding: "1rem" }}>
      <p style={{ color: "#26382e", fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>当前状态：{isPublished ? "已发布" : "草稿"}</p>
      <p style={{ color: "#5e6b63", fontSize: "0.78rem", lineHeight: 1.55, margin: "0.35rem 0 0" }}>
        {isPublished ? "网站访客可以看到这条路线。修改后请点击“更新已发布内容”。" : "草稿不会出现在网站中，可以在内容完整后再发布。"}
      </p>
      {dirty ? <p style={{ color: "#9a6326", fontSize: "0.74rem", margin: "0.55rem 0 0" }}>当前有尚未保存的修改。</p> : null}
      <dl style={{ display: "grid", fontSize: "0.76rem", gap: "0.35rem", gridTemplateColumns: "auto 1fr", margin: "0.9rem 0" }}>
        <dt style={{ color: "#718077" }}>路线</dt><dd style={{ color: "#26382e", margin: 0 }}>{title}</dd>
        <dt style={{ color: "#718077" }}>地区</dt><dd style={{ color: "#26382e", margin: 0 }}>{region}</dd>
        <dt style={{ color: "#718077" }}>首图</dt><dd style={{ color: "#26382e", margin: 0 }}>{hasHero ? "已完成" : "尚未完成"}</dd>
        <dt style={{ color: "#718077" }}>页面网址</dt><dd style={{ color: "#26382e", margin: 0, overflowWrap: "anywhere" }}>{slug}</dd>
      </dl>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
        {!isPublished ? (
          <>
            <button disabled={submitting} onClick={() => void submitAs("draft")} style={{ ...buttonBase, background: "#fff", border: "1px solid #355542", color: "#355542" }} type="button">保存草稿</button>
            <button disabled={submitting} onClick={() => void submitAs("published")} style={{ ...buttonBase, background: "#355542", border: "1px solid #355542", color: "#fff" }} type="button">发布徒步路线</button>
          </>
        ) : (
          <>
            <button disabled={submitting} onClick={() => void submitAs("published")} style={{ ...buttonBase, background: "#355542", border: "1px solid #355542", color: "#fff" }} type="button">更新已发布内容</button>
            <button disabled={submitting} onClick={() => void submitAs("draft")} style={{ ...buttonBase, background: "transparent", border: "1px solid #b5aa91", color: "#5b584f" }} type="button">转为草稿</button>
          </>
        )}
      </div>
      <p aria-live="polite" style={{ color: message.includes("失败") ? "#b42318" : "#4e6557", fontSize: "0.76rem", margin: message ? "0.75rem 0 0" : 0 }}>{message}</p>
      {meta.touched && meta.error ? <p style={{ color: "#b42318", fontSize: "0.76rem", marginBottom: 0 }}>{String(meta.error)}</p> : null}
      {field.description ? <p style={{ color: "#718077", fontSize: "0.72rem", lineHeight: 1.5, margin: "0.75rem 0 0" }}>{field.description}</p> : null}
    </section>
  );
}
