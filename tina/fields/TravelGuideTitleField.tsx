import {
  useRef,
  type ChangeEvent,
  type CompositionEvent,
  type CSSProperties,
  type FocusEvent,
  type FormEvent,
} from "react";
import { useFormState } from "react-final-form";
import type { TinaField } from "tinacms";
import { normalizeTravelGuideTitleValue } from "../../shared/travelGuideDefaults";

type FieldProps = {
  input: {
    name: string;
    value?: string;
    onChange: (value: string) => void;
    onBlur: (event?: FocusEvent<HTMLInputElement>) => void;
    onFocus: (event?: FocusEvent<HTMLInputElement>) => void;
  };
  field: TinaField;
  meta: { error?: unknown; touched?: boolean };
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

export function readTravelGuideTitleInput(event: Pick<ChangeEvent<HTMLInputElement>, "currentTarget">) {
  return normalizeTravelGuideTitleValue(event.currentTarget.value);
}

export function TravelGuideTitleField({ input, meta }: FieldProps) {
  const composing = useRef(false);
  const { values } = useFormState<{ title?: string }>({ subscription: { values: true } });
  const currentValue = normalizeTravelGuideTitleValue(values.title ?? input.value);

  function commitValue(value: unknown) {
    // Use the already-registered Tina field rather than registering a second
    // useField subscription. Final Form updates this value synchronously, so
    // Tina's group click guard sees it in the same browser gesture.
    input.onChange(normalizeTravelGuideTitleValue(value));
  }

  function commitCurrentValue(event: ChangeEvent<HTMLInputElement> | CompositionEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>) {
    commitValue(event.currentTarget.value);
  }

  function handleCompositionStart() {
    composing.current = true;
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLInputElement>) {
    composing.current = false;
    commitCurrentValue(event);
  }

  function handleInput(event: FormEvent<HTMLInputElement>) {
    // React's input event fires for every visible IME update, including while a
    // composition is still active. Final Form therefore has the text before a
    // group card's click handler checks form validity.
    commitValue(event.currentTarget.value);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    // Some Windows IMEs finish composition as focus moves to a group button.
    // Commit the DOM value once more before Final Form receives the blur.
    if (composing.current || event.currentTarget.value !== currentValue) {
      composing.current = false;
      commitCurrentValue(event);
    }
    input.onBlur(event);
  }

  return (
    <section style={{ display: "grid", gap: "0.45rem" }}>
      <label htmlFor={input.name} style={{ color: "#334155", fontSize: "0.82rem", fontWeight: 650 }}>
        1. 标题（英文）
      </label>
      <p style={{ color: "#718077", fontSize: "0.72rem", lineHeight: 1.45, margin: 0 }}>
        用于后台列表、未来详情页和默认搜索标题。可以先浏览其他部分；保存草稿前再填写即可。
      </p>
      <input
        aria-label="攻略标题（英文）"
        id={input.name}
        onBlur={handleBlur}
        onChange={(event) => commitValue(readTravelGuideTitleInput(event))}
        onCompositionEnd={handleCompositionEnd}
        onCompositionStart={handleCompositionStart}
        onFocus={input.onFocus}
        onInput={handleInput}
        placeholder="A Practical Guide to Travelling in Yunnan"
        style={inputStyle}
        value={currentValue}
      />
      {meta.touched && meta.error ? <p style={{ color: "#b42318", fontSize: "0.76rem", margin: 0 }}>{String(meta.error)}</p> : null}
    </section>
  );
}
