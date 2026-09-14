import type { ChangeEvent, CSSProperties, FocusEvent } from "react";
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
  displayWidth: [
    { value: "standard", label: "标准图", diagram: "▰▰", help: "适合大多数路线画面" },
    { value: "large", label: "大图", diagram: "▰▰▰", help: "突出重要风景或人物" },
    { value: "full-bleed", label: "通栏图", diagram: "━━━━", help: "由未来模板铺满内容区域" },
    { value: "half", label: "半宽图", diagram: "▰ ▰", help: "相邻两张可在电脑端并排" },
  ],
  displayRatio: [
    { value: "original", label: "保持原图比例", diagram: "◇", help: "完整显示原始画面" },
    { value: "landscape-16-9", label: "横图 16:9", diagram: "▰", help: "适合开阔风景" },
    { value: "landscape-4-3", label: "横图 4:3", diagram: "▰", help: "适合一般旅行画面" },
    { value: "portrait-3-4", label: "竖图 3:4", diagram: "▮", help: "适合人物或纵向场景" },
    { value: "portrait-9-16", label: "长竖图 9:16", diagram: "▮", help: "适合长幅竖向画面" },
  ],
  alignment: [
    { value: "center", label: "居中", diagram: "↔", help: "默认居中显示" },
    { value: "left", label: "靠左", diagram: "⇤", help: "在可用区域靠左" },
    { value: "right", label: "靠右", diagram: "⇥", help: "在可用区域靠右" },
  ],
  focalPoint: [
    { value: "center", label: "中间", diagram: "◎", help: "优先保留画面中心" },
    { value: "top", label: "上方", diagram: "↑", help: "优先保留山峰或天空" },
    { value: "bottom", label: "下方", diagram: "↓", help: "优先保留画面下部" },
    { value: "left", label: "左侧", diagram: "←", help: "优先保留画面左侧" },
    { value: "right", label: "右侧", diagram: "→", help: "优先保留画面右侧" },
  ],
};

export function WalkImagePresetCardsField({ input, field, meta }: FieldProps) {
  const fieldKey = input.name.split(".").at(-1) ?? field.name;
  const fieldChoices = choices[fieldKey] ?? [];
  const gridStyle = {
    display: "grid",
    gap: "0.55rem",
    gridTemplateColumns: `repeat(${Math.min(fieldChoices.length, 4)}, minmax(0, 1fr))`,
  } satisfies CSSProperties;

  return (
    <fieldset style={{ border: 0, margin: "0 0 1rem", minWidth: 0, padding: 0 }}>
      <legend style={{ color: "#334155", fontSize: "0.82rem", fontWeight: 650, marginBottom: "0.3rem" }}>
        {field.label || field.name}
      </legend>
      {field.description ? <p style={{ color: "#718077", fontSize: "0.72rem", lineHeight: 1.45, margin: "0 0 0.6rem" }}>{field.description}</p> : null}
      <div aria-label={String(field.label || field.name)} role="radiogroup" style={gridStyle}>
        {fieldChoices.map((choice) => {
          const selected = input.value === choice.value;
          return (
            <button
              aria-checked={selected}
              key={choice.value}
              onClick={() => input.onChange(choice.value as unknown as ChangeEvent<string>)}
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
                fontSize: "0.76rem",
                gap: "0.3rem",
                justifyContent: "center",
                minHeight: "5.8rem",
                padding: "0.5rem 0.3rem",
              }}
              type="button"
            >
              <span aria-hidden="true" style={{ color: "#a47c32", fontSize: "1.05rem", lineHeight: 1 }}>{choice.diagram}</span>
              <span>{choice.label}</span>
              <span style={{ color: "#6d766f", fontSize: "0.66rem", fontWeight: 400, lineHeight: 1.35 }}>{choice.help}</span>
            </button>
          );
        })}
      </div>
      {meta.touched && meta.error ? <p style={{ color: "#b42318", fontSize: "0.75rem" }}>{String(meta.error)}</p> : null}
    </fieldset>
  );
}
