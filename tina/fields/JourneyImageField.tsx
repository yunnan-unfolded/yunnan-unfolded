import { useCallback, useState, type ChangeEvent, type FocusEvent } from "react";
import { useForm, useFormState } from "react-final-form";
import { ImageField, type TinaField } from "tinacms";

type ImageFieldProps = {
  input: {
    name: string;
    value: string;
    onChange: (event: ChangeEvent<string>) => void;
    onBlur: (event?: FocusEvent<string>) => void;
    onFocus: (event?: FocusEvent<string>) => void;
  };
  field: TinaField & { namespace: string[] };
  meta: { error?: unknown };
};

function siblingPath(name: string, sibling: string) {
  const parts = name.split(".");
  parts[parts.length - 1] = sibling;
  return parts.join(".");
}

function readFormValue(values: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[part];
  }, values);
}

export function JourneyImageField(props: ImageFieldProps) {
  const { input } = props;
  const form = useForm();
  const { dirty } = useFormState({ subscription: { dirty: true } });
  const [changedPath, setChangedPath] = useState("");
  const [feedback, setFeedback] = useState("");
  const onChange = useCallback((event: ChangeEvent<string> | string) => {
    const target = typeof event === "string" ? undefined : (event as unknown as { target?: { value?: string } }).target;
    const value = typeof event === "string" ? event : String(target?.value || "");
    if (value && value === input.value) {
      setFeedback("所选图片与当前图片使用相同文件名。为避免浏览器继续显示旧缓存，请先将新文件改为唯一文件名后再上传。");
      return;
    }

    const currentValues = form.getState().values;
    const existingRatio = readFormValue(currentValues, siblingPath(input.name, "displayRatio"));
    input.onChange(value as unknown as ChangeEvent<string>);
    setChangedPath(value);
    setFeedback(value ? "图片已更换，尚未保存。" : "图片已移除，尚未保存。");
    if (!value || typeof window === "undefined") return;

    const image = new window.Image();
    image.onload = () => {
      form.change(siblingPath(input.name, "width"), image.naturalWidth);
      form.change(siblingPath(input.name, "height"), image.naturalHeight);
      form.change(siblingPath(input.name, "legacyAspect"), undefined);
      if (!existingRatio) {
        form.change(
          siblingPath(input.name, "displayRatio"),
          image.naturalHeight > image.naturalWidth ? "portrait-3-4" : "landscape-4-3",
        );
      }
      setFeedback("图片已更换，尺寸已重新读取，尚未保存。");
    };
    image.onerror = () => setFeedback("图片路径已更新，但暂时无法读取尺寸。请确认文件可打开后再保存。");
    const separator = value.includes("?") ? "&" : "?";
    image.src = `${value}${separator}tina-dimension-check=${Date.now()}`;
  }, [form, input]);

  const imageProps = {
    ...props,
    field: {
      ...props.field,
      label: input.value ? "替换图片" : "选择图片",
      description: input.value
        ? "点击缩略图或替换操作选择另一张图片；比例和画面重点会保留。替换上传请使用不同的唯一英文文件名，避免浏览器继续显示旧缓存。"
        : "从图片库选择，或上传使用唯一英文文件名的新图片。",
    },
    form,
    tinaForm: form,
    input: { ...input, onChange },
  } as unknown as Parameters<typeof ImageField>[0];
  const statusMessage = changedPath && !dirty && !feedback.includes("无法")
    ? "图片更换已保存。"
    : feedback;

  return (
    <div>
      <ImageField {...imageProps} />
      {statusMessage ? (
        <p
          aria-live="polite"
          role="status"
          style={{ color: statusMessage.includes("无法") || statusMessage.includes("相同文件名") ? "#9b3d32" : "#4e6557", fontSize: "0.72rem", lineHeight: 1.45, margin: "0.45rem 0 0" }}
        >
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}
