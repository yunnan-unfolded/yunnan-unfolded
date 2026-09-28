import { useState, type ChangeEvent, type FocusEvent } from "react";
import { useForm, useFormState } from "react-final-form";
import type { TinaField } from "tinacms";
import { getTravelGuidePublishMissingFields } from "../travelGuideSave";

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

const buttonBase = {
  borderRadius: "0.4rem",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.85rem",
  fontWeight: 650,
  minHeight: "2.6rem",
  padding: "0.65rem 1rem",
} as const;

export function TravelGuidePublicationStatusField({ input, field, meta }: FieldProps) {
  const form = useForm();
  const { values, submitting } = useFormState<Record<string, unknown>>({
    subscription: { values: true, submitting: true },
  });
  const [message, setMessage] = useState("");
  const isPublished = input.value === "published";

  async function submitAs(status: "draft" | "published") {
    if (submitting) return;

    const title = typeof values.title === "string" ? values.title.trim() : "";
    if (status === "draft" && !title) {
      setMessage("无法保存草稿。请先填写第 1 部分「标题（英文）」。内容尚未保存，您仍可继续编辑其他部分。");
      return;
    }

    if (status === "published") {
      const missing = getTravelGuidePublishMissingFields(values);
      if (missing.length > 0) {
        setMessage(`无法发布。请完成：${missing.join("、")}。内容尚未保存，当前版本仍保持草稿状态。`);
        return;
      }
    }

    input.onChange(status as unknown as ChangeEvent<string>);
    form.change(input.name, status);
    setMessage("");
    try {
      const result = await form.submit();
      setMessage(result
        ? "保存失败：内容尚未保存。请查看页面中的中文提示并修正后重试。"
        : status === "published" ? "旅行攻略已发布" : "草稿已保存");
    } catch {
      setMessage("保存失败：内容尚未保存。请查看页面中的中文提示并修正后重试。");
    }
  }

  return (
    <section style={{ background: "#f7f4ec", border: "1px solid #ddd5c2", borderRadius: "0.55rem", marginBottom: "1.25rem", padding: "1rem" }}>
      <p style={{ color: "#26382e", fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>
        当前状态：{isPublished ? "已发布" : "草稿"}
      </p>
      <p style={{ color: "#5e6b63", fontSize: "0.78rem", lineHeight: 1.55, margin: "0.35rem 0 0" }}>
        {isPublished ? "网站访客可以看到这篇攻略。修改后请更新已发布内容。" : "草稿不会出现在正式网站中，可以在内容完整前反复保存。"}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "0.9rem" }}>
        {!isPublished ? (
          <>
            <button disabled={submitting} onClick={() => void submitAs("draft")} style={{ ...buttonBase, background: "#fff", border: "1px solid #355542", color: "#355542" }} type="button">
              保存草稿
            </button>
            <button disabled={submitting} onClick={() => void submitAs("published")} style={{ ...buttonBase, background: "#355542", border: "1px solid #355542", color: "#fff" }} type="button">
              发布旅行攻略
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
      <p aria-live="polite" style={{ color: message.startsWith("无法") || message.startsWith("保存失败") ? "#9b2c2c" : "#4e6557", fontSize: "0.76rem", lineHeight: 1.55, margin: message ? "0.75rem 0 0" : 0 }}>
        {message}
      </p>
      {meta.touched && meta.error ? <p style={{ color: "#b42318", fontSize: "0.76rem", marginBottom: 0 }}>{String(meta.error)}</p> : null}
      {field.description ? <p style={{ color: "#718077", fontSize: "0.72rem", lineHeight: 1.5, margin: "0.75rem 0 0" }}>{field.description}</p> : null}
    </section>
  );
}
