import type { CSSProperties, ChangeEvent, FocusEvent } from "react";
import { useForm, useFormState } from "react-final-form";
import type { TinaField } from "tinacms";

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

type Choice = { value: string; label: string; diagram: string; help: string };

const choices: Record<string, Choice[]> = {
  mediaLayout: [
    { value: "image-above", label: "图片在上", diagram: "▰\n▤", help: "先看图片，再阅读当天内容" },
    { value: "image-left", label: "图片在左", diagram: "▣▤", help: "电脑端左图右文，手机端自动上下排列" },
    { value: "image-right", label: "图片在右", diagram: "▤▣", help: "电脑端左文右图，手机端自动上下排列" },
    { value: "two-images", label: "双图并排", diagram: "▣▣", help: "电脑端并排，手机端自动上下排列" },
    { value: "text-only", label: "仅文字", diagram: "▤", help: "当天不显示图片" },
  ],
  imageSize: [
    { value: "compact", label: "小图", diagram: "▰", help: "适合人物或手作细节" },
    { value: "standard", label: "标准图", diagram: "▰▰", help: "适合大多数每日行程" },
    { value: "wide", label: "大图", diagram: "▰▰▰", help: "占满当天正文宽度" },
  ],
  displayRatio: [
    { value: "original", label: "原始比例", diagram: "◇", help: "完整显示，不裁切" },
    { value: "landscape-16-9", label: "16:9 横图", diagram: "▰", help: "适合宽阔风景" },
    { value: "landscape-4-3", label: "4:3 横图", diagram: "▰", help: "适合一般旅行画面" },
    { value: "portrait-3-4", label: "3:4 竖图", diagram: "▮", help: "适合人物和纵向场景" },
    { value: "portrait-9-16", label: "9:16 竖图", diagram: "▮", help: "手机端自动限制高度" },
  ],
  focalPoint: [
    { value: "center", label: "居中（推荐）", diagram: "◎", help: "通常无需调整" },
    { value: "top", label: "偏上", diagram: "↑", help: "优先保留画面上方" },
    { value: "bottom", label: "偏下", diagram: "↓", help: "优先保留画面下方" },
    { value: "left", label: "偏左", diagram: "←", help: "优先保留画面左侧" },
    { value: "right", label: "偏右", diagram: "→", help: "优先保留画面右侧" },
  ],
};

function valueAtPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, source);
}

function siblingPath(name: string, sibling: string) {
  const parts = name.split(".");
  parts[parts.length - 1] = sibling;
  return parts.join(".");
}

export function PresetCardsField({ input, field, meta }: FieldProps) {
  const form = useForm();
  const { values } = useFormState({ subscription: { values: true } });
  const fieldKey = field.name.split(".").at(-1) ?? field.name;
  const fieldChoices = choices[fieldKey] ?? [];
  const mediaLayout = valueAtPath(values, siblingPath(input.name, "mediaLayout"));
  const displayRatio = valueAtPath(values, siblingPath(input.name, "displayRatio"));

  if (fieldKey === "imageSize" && mediaLayout === "text-only") return null;
  if (fieldKey === "focalPoint" && displayRatio === "original") return null;

  const visibleChoices = fieldKey === "imageSize" && mediaLayout === "two-images"
    ? fieldChoices.filter((choice) => choice.value !== "compact")
    : fieldChoices;
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${fieldKey === "mediaLayout" ? 2 : Math.min(visibleChoices.length, 5)}, minmax(0, 1fr))`,
    gap: "0.55rem",
  } satisfies CSSProperties;

  return (
    <fieldset style={{ border: 0, display: "block", gridColumn: "1 / -1", margin: "0 0 1.25rem", minWidth: 0, padding: 0, width: "100%" }}>
      <legend style={{ color: "#334155", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.3rem" }}>
        {field.label || field.name}
      </legend>
      {field.description ? <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "0 0 0.65rem" }}>{field.description}</p> : null}
      <div role="radiogroup" aria-label={String(field.label || field.name)} style={gridStyle}>
        {visibleChoices.map((choice) => {
        const selected = input.value === choice.value;
        return (
          <button
            aria-checked={selected}
            key={choice.value}
            onClick={() => {
              input.onChange(choice.value as unknown as ChangeEvent<string>);
              if (fieldKey === "displayRatio") form.change(siblingPath(input.name, "legacyAspect"), undefined);
              if (fieldKey === "mediaLayout" && choice.value === "two-images") {
                form.change(siblingPath(input.name, "imageSize"), "standard");
              }
            }}
            role="radio"
            style={{
              alignItems: "center",
              background: selected ? "#eef2eb" : "#fff",
              border: selected ? "2px solid #355542" : "1px solid #d7d9d4",
              borderRadius: "0.4rem",
              color: "#25362b",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              fontFamily: "inherit",
              fontSize: "0.78rem",
              gap: "0.35rem",
              justifyContent: "center",
              minHeight: fieldKey === "mediaLayout" ? "6.6rem" : "5.8rem",
              padding: "0.55rem 0.35rem",
              whiteSpace: "pre-line",
            }}
            type="button"
          >
            <span aria-hidden="true" style={{ color: "#a47c32", fontSize: "1.1rem", letterSpacing: "0.1rem", lineHeight: 1.1 }}>
              {choice.diagram}
            </span>
            <span>{choice.label}</span>
            <span style={{ color: "#6d766f", fontSize: "0.68rem", fontWeight: 400, lineHeight: 1.35 }}>
              {choice.help}
            </span>
          </button>
        );
        })}
      </div>
      {meta.touched && meta.error ? <p style={{ color: "#b42318", fontSize: "0.75rem" }}>{String(meta.error)}</p> : null}
    </fieldset>
  );
}
