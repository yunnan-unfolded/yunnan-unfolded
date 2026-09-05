import { useState, type ChangeEvent, type CSSProperties, type DragEvent, type FocusEvent } from "react";
import { useField } from "react-final-form";
import type { TinaField } from "tinacms";
import { JourneyImageField } from "./JourneyImageField";

type ImageValue = { src?: string; alt?: string; width?: number; height?: number };
type FieldProps = {
  input: {
    name: string;
    value?: ImageValue[];
    onChange: (event: ChangeEvent<ImageValue[]> | ImageValue[]) => void;
    onBlur: (event?: FocusEvent<ImageValue[]>) => void;
    onFocus: (event?: FocusEvent<ImageValue[]>) => void;
  };
  field: TinaField & { namespace: string[] };
  meta: { error?: unknown; touched?: boolean };
};

const buttonStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #9fac9f",
  borderRadius: "0.4rem",
  color: "#355542",
  cursor: "pointer",
  font: "inherit",
  fontSize: "0.72rem",
  fontWeight: 650,
  minHeight: "2.3rem",
  padding: "0.45rem 0.7rem",
};

function GalleryImageSource({ path }: { path: string }) {
  const { input, meta } = useField<string>(path, { subscription: { value: true, error: true, touched: true } });
  return (
    <JourneyImageField
      field={{ type: "image", name: "src", label: "选择或上传图片", description: "", namespace: ["journey", ...path.split(".")] } as TinaField & { namespace: string[] }}
      input={input as never}
      meta={meta}
    />
  );
}

export function JourneyGalleryField({ input, meta }: FieldProps) {
  const images = Array.isArray(input.value) ? input.value : [];
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const update = (next: ImageValue[]) => input.onChange(next);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next);
  };

  return (
    <section style={{ borderTop: "1px solid #e2ded4", marginTop: "0.9rem", paddingTop: "0.9rem" }}>
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "#334155", fontSize: "0.82rem", fontWeight: 700, margin: 0 }}>亮点图片</p>
          <p style={{ color: "#718077", fontSize: "0.7rem", lineHeight: 1.45, margin: "0.25rem 0 0" }}>建议按路线内容选择图片，可继续添加；手机端会自动单列显示。</p>
        </div>
        <button onClick={() => update([...images, { src: "", alt: "" }])} style={buttonStyle} type="button">添加图片</button>
      </div>

      <div style={{ display: "grid", gap: "0.65rem", marginTop: "0.75rem" }}>
        {images.map((image, index) => (
          <article
            draggable
            key={`gallery-image-${index}`}
            onDragEnd={() => setDragIndex(null)}
            onDragOver={(event: DragEvent<HTMLElement>) => event.preventDefault()}
            onDragStart={() => setDragIndex(index)}
            onDrop={() => { if (dragIndex !== null) move(dragIndex, index); setDragIndex(null); }}
            style={{ background: "#fff", border: "1px solid #dedbd2", borderRadius: "0.45rem", padding: "0.75rem" }}
          >
            <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: "0.55rem" }}>
              <strong style={{ color: "#526158", fontSize: "0.72rem" }}>图片 {index + 1}</strong>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <button disabled={index === 0} onClick={() => move(index, index - 1)} style={buttonStyle} type="button">前移</button>
                <button disabled={index === images.length - 1} onClick={() => move(index, index + 1)} style={buttonStyle} type="button">后移</button>
                <button onClick={() => { if (window.confirm("确定从本路线移除这张图片吗？图片文件本身不会被删除。")) update(images.filter((_, imageIndex) => imageIndex !== index)); }} style={{ ...buttonStyle, color: "#8a3d34" }} type="button">移除</button>
              </div>
            </div>
            <GalleryImageSource path={`${input.name}.${index}.src`} />
            <details style={{ marginTop: "0.55rem" }}>
              <summary style={{ color: "#53655a", cursor: "pointer", fontSize: "0.7rem", fontWeight: 650 }}>高级：图片英文说明</summary>
              <textarea
                aria-label={`图片 ${index + 1} 英文说明`}
                onChange={(event) => update(images.map((item, imageIndex) => imageIndex === index ? { ...item, alt: event.target.value } : item))}
                placeholder="用于 SEO 和无障碍，不显示为网页图片标题。"
                rows={2}
                style={{ border: "1px solid #d1d5db", borderRadius: "0.4rem", font: "inherit", fontSize: "0.78rem", marginTop: "0.5rem", padding: "0.6rem", resize: "vertical", width: "100%" }}
                value={image.alt ?? ""}
              />
            </details>
          </article>
        ))}
      </div>
      {meta.touched && meta.error ? <p style={{ color: "#b42318", fontSize: "0.75rem" }}>{String(meta.error)}</p> : null}
    </section>
  );
}
