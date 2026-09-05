import type { ChangeEvent, CSSProperties, FocusEvent } from "react";
import type { TinaField } from "tinacms";

type Highlight = { title?: string; description?: string };
type FieldProps = {
  input: {
    name: string;
    value?: Highlight[];
    onChange: (event: ChangeEvent<Highlight[]> | Highlight[]) => void;
    onBlur: (event?: FocusEvent<Highlight[]>) => void;
    onFocus: (event?: FocusEvent<Highlight[]>) => void;
  };
  field: TinaField & { namespace: string[] };
  meta: { error?: unknown; touched?: boolean };
};

const textareaStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: "0.4rem",
  color: "#26382e",
  font: "inherit",
  fontSize: "0.86rem",
  lineHeight: 1.6,
  minHeight: "12rem",
  padding: "0.75rem",
  resize: "vertical",
  width: "100%",
};

function nextHighlights(text: string, current: Highlight[]) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const used = new Set<number>();
  return lines.map((title, index) => {
    const exactIndex = current.findIndex((item, itemIndex) => !used.has(itemIndex) && item.title?.trim() === title);
    const fallbackIndex = exactIndex >= 0 ? exactIndex : current.findIndex((_, itemIndex) => !used.has(itemIndex) && itemIndex === index);
    if (fallbackIndex >= 0) {
      used.add(fallbackIndex);
      return { ...current[fallbackIndex], title };
    }
    return { title, description: "" };
  });
}

export function HighlightsBulkField({ input, field, meta }: FieldProps) {
  const items = Array.isArray(input.value) ? input.value : [];
  const update = (next: Highlight[]) => input.onChange(next);

  return (
    <section style={{ marginBottom: "1.25rem" }}>
      <label style={{ color: "#334155", display: "grid", fontSize: "0.86rem", fontWeight: 650, gap: "0.35rem" }}>
        <span>{field.label || "行程亮点（每行一条）"}</span>
        <small style={{ color: "#718077", fontSize: "0.72rem", fontWeight: 400, lineHeight: 1.5 }}>
          一次粘贴多条内容，每行自动成为一条亮点。空行会在保存时自动清理，原有顺序会保留。
        </small>
        <textarea
          aria-label="行程亮点（每行一条）"
          onChange={(event) => update(nextHighlights(event.target.value, items))}
          placeholder="Walk among wild rhododendrons during Yunnan’s mountain flowering season"
          style={textareaStyle}
          value={items.map((item) => item.title ?? "").join("\n")}
        />
      </label>

      {items.some((item) => item.description?.trim()) ? (
        <details style={{ borderTop: "1px solid #e2ded4", marginTop: "0.75rem", paddingTop: "0.75rem" }}>
          <summary style={{ color: "#53655a", cursor: "pointer", fontSize: "0.76rem", fontWeight: 650 }}>
            高级：保留的亮点详细说明
          </summary>
          <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
            {items.map((item, index) => (
              <label key={`${item.title}-${index}`} style={{ color: "#526158", display: "grid", fontSize: "0.74rem", gap: "0.3rem" }}>
                <span>{item.title || `亮点 ${index + 1}`}</span>
                <textarea
                  onChange={(event) => update(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry))}
                  rows={3}
                  style={{ ...textareaStyle, minHeight: "5rem" }}
                  value={item.description ?? ""}
                />
              </label>
            ))}
          </div>
        </details>
      ) : null}

      {meta.touched && meta.error ? <p style={{ color: "#b42318", fontSize: "0.75rem" }}>{String(meta.error)}</p> : null}
    </section>
  );
}
