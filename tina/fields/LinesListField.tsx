import type { ChangeEvent, CSSProperties, FocusEvent } from "react";
import type { TinaField } from "tinacms";
import { normalizeLinesList } from "../../shared/journeyDefaults";

type FieldProps = {
  input: {
    name: string;
    value?: string[];
    onChange: (event: ChangeEvent<string[]> | string[]) => void;
    onBlur: (event?: FocusEvent<string[]>) => void;
    onFocus: (event?: FocusEvent<string[]>) => void;
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
  minHeight: "9rem",
  padding: "0.75rem",
  resize: "vertical",
  width: "100%",
};

export function LinesListField({ input, field, meta }: FieldProps) {
  const lines = normalizeLinesList(input.value);

  return (
    <label style={{ color: "#334155", display: "grid", fontSize: "0.86rem", fontWeight: 650, gap: "0.35rem", marginBottom: "1.1rem" }}>
      <span>{field.label}</span>
      <small style={{ color: "#718077", fontSize: "0.72rem", fontWeight: 400, lineHeight: 1.5 }}>
        {field.description || "每行填写一条。保存时会自动清除空行和每行首尾空格。"}
      </small>
      <textarea
        aria-label={String(field.label || "每行一条")}
        onBlur={() => input.onBlur()}
        onChange={(event) => input.onChange(normalizeLinesList(event.target.value))}
        onFocus={() => input.onFocus()}
        style={textareaStyle}
        value={lines.join("\n")}
      />
      {meta.touched && meta.error ? <small style={{ color: "#b42318", fontWeight: 500 }}>{String(meta.error)}</small> : null}
    </label>
  );
}
