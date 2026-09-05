import { useState, type ChangeEvent, type CSSProperties, type DragEvent, type FocusEvent } from "react";
import { useField } from "react-final-form";
import type { TinaField } from "tinacms";
import { JourneyImageField } from "./JourneyImageField";

type JourneyImageValue = {
  src?: string;
  alt?: string;
  displayRatio?: string;
  focalPoint?: string;
  width?: number;
  height?: number;
  legacyAspect?: string;
};

type JourneyOptionValue = {
  label?: string;
  title?: string;
  description?: string;
  points?: string[];
};

type JourneyDayValue = {
  day?: number;
  title?: string;
  logistics?: string;
  route?: string;
  drive?: string;
  overnight?: string;
  subtitle?: string;
  paragraphs?: string[];
  experiences?: string[];
  note?: string;
  mediaLayout?: string;
  imageSize?: string;
  images?: JourneyImageValue[];
  options?: JourneyOptionValue[];
};

type FieldProps = {
  input: {
    name: string;
    value?: JourneyDayValue[];
    onChange: (event: ChangeEvent<JourneyDayValue[]> | JourneyDayValue[]) => void;
    onBlur: (event?: FocusEvent<JourneyDayValue[]>) => void;
    onFocus: (event?: FocusEvent<JourneyDayValue[]>) => void;
  };
  field: TinaField & { namespace: string[] };
  meta: { error?: unknown; touched?: boolean };
};

const controlStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: "0.4rem",
  color: "#26382e",
  font: "inherit",
  fontSize: "0.84rem",
  minHeight: "2.6rem",
  padding: "0.62rem 0.7rem",
  width: "100%",
};

const secondaryButton: CSSProperties = {
  background: "#fff",
  border: "1px solid #9fac9f",
  borderRadius: "0.4rem",
  color: "#355542",
  cursor: "pointer",
  font: "inherit",
  fontSize: "0.74rem",
  fontWeight: 650,
  minHeight: "2.35rem",
  padding: "0.5rem 0.75rem",
};

const ratioChoices = [
  ["original", "原始比例", "完整显示，不裁切"],
  ["landscape-16-9", "16:9 横图", "适合宽阔风景"],
  ["landscape-4-3", "4:3 横图", "适合一般旅行画面"],
  ["portrait-3-4", "3:4 竖图", "适合人物和纵向场景"],
  ["portrait-9-16", "9:16 竖图", "手机端会限制可视高度"],
] as const;

const focalChoices = [
  ["center", "居中"], ["top", "上方"], ["bottom", "下方"], ["left", "左侧"], ["right", "右侧"],
] as const;

const layoutChoices = [
  ["wide", "大图通栏", "图片占满当天正文宽度"],
  ["left", "图片在左", "电脑端左图右文"],
  ["right", "图片在右", "电脑端左文右图"],
  ["two", "双图并排", "手机端自动上下排列"],
] as const;

function lines(value?: string[]) {
  return (value ?? []).join("\n");
}

function paragraphs(value?: string[]) {
  return (value ?? []).join("\n\n");
}

function cleanLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function paragraphLines(value: string) {
  return value.split(/(?:\r?\n){2,}/).map((line) => line.trim()).filter(Boolean);
}

function dayLogistics(day: JourneyDayValue) {
  if (typeof day.logistics === "string") return day.logistics;
  return [day.route, day.drive, day.overnight ? `Overnight: ${day.overnight}` : ""].filter(Boolean).join(" · ");
}

function layoutPreset(day: JourneyDayValue) {
  if (day.mediaLayout === "two-images") return "two";
  if (day.mediaLayout === "image-left" && day.imageSize === "standard") return "left";
  if (day.mediaLayout === "image-right" && day.imageSize === "standard") return "right";
  if (day.mediaLayout === "image-above" && day.imageSize === "wide") return "wide";
  return "legacy";
}

function applyLayout(day: JourneyDayValue, choice: string): JourneyDayValue {
  if (choice === "wide") return { ...day, mediaLayout: "image-above", imageSize: "wide" };
  if (choice === "left") return { ...day, mediaLayout: "image-left", imageSize: "standard" };
  if (choice === "two") return { ...day, mediaLayout: "two-images", imageSize: "wide" };
  return { ...day, mediaLayout: "image-right", imageSize: "standard" };
}

function ImageSourceField({ path }: { path: string }) {
  const { input, meta } = useField<string>(path, { subscription: { value: true, error: true, touched: true } });
  return (
    <JourneyImageField
      field={{
        type: "image",
        name: "src",
        label: "选择或上传图片",
        description: "可从图片库选择，也可以上传新图片。",
        namespace: ["journey", ...path.split(".")],
      } as TinaField & { namespace: string[] }}
      input={input as never}
      meta={meta}
    />
  );
}

function ChoiceCards({ choices, label, onChange, value }: {
  choices: ReadonlyArray<readonly [string, string, string]>;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
      <legend style={{ color: "#334155", fontSize: "0.78rem", fontWeight: 650, marginBottom: "0.45rem" }}>{label}</legend>
      <div style={{ display: "grid", gap: "0.45rem", gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))" }}>
        {choices.map(([choiceValue, choiceLabel, help]) => {
          const selected = value === choiceValue;
          return (
            <button
              aria-checked={selected}
              key={choiceValue}
              onClick={() => onChange(choiceValue)}
              role="radio"
              style={{
                ...secondaryButton,
                background: selected ? "#eef2eb" : "#fff",
                border: selected ? "2px solid #355542" : "1px solid #d5d9d3",
                color: "#26382e",
                minHeight: "4.8rem",
                padding: "0.55rem",
              }}
              type="button"
            >
              <span style={{ display: "block", fontSize: "0.76rem" }}>{choiceLabel}</span>
              <small style={{ color: "#718077", display: "block", fontSize: "0.66rem", fontWeight: 400, lineHeight: 1.35, marginTop: "0.25rem" }}>{help}</small>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function JourneyDaysField({ input, meta }: FieldProps) {
  const days = Array.isArray(input.value) ? input.value : [];
  const [expanded, setExpanded] = useState(0);
  const [dragDay, setDragDay] = useState<number | null>(null);

  const updateDays = (next: JourneyDayValue[]) => input.onChange(next.map((day, index) => ({ ...day, day: index + 1 })));
  const updateDay = (index: number, updater: (day: JourneyDayValue) => JourneyDayValue) => {
    updateDays(days.map((day, dayIndex) => dayIndex === index ? updater(day) : day));
  };
  const moveDay = (from: number, to: number) => {
    if (to < 0 || to >= days.length || from === to) return;
    const next = [...days];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateDays(next);
    setExpanded(to);
  };

  return (
    <section style={{ marginBottom: "1.25rem" }}>
      <p style={{ color: "#647168", fontSize: "0.74rem", lineHeight: 1.55, margin: "0 0 0.8rem" }}>
        每天只需填写标题、交通与住宿、正文和图片。拖动卡片或使用上下按钮即可调整顺序，Day 编号会自动更新。
      </p>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {days.map((day, index) => {
          const isOpen = expanded === index;
          const images = day.images ?? [];
          const selectedLayout = layoutPreset(day);
          return (
            <article
              draggable
              key={`${day.day}-${index}`}
              onDragEnd={() => setDragDay(null)}
              onDragOver={(event: DragEvent<HTMLElement>) => event.preventDefault()}
              onDragStart={() => setDragDay(index)}
              onDrop={() => { if (dragDay !== null) moveDay(dragDay, index); setDragDay(null); }}
              style={{ background: "#fbfaf6", border: isOpen ? "2px solid #b7a275" : "1px solid #ddd8cc", borderRadius: "0.55rem", overflow: "hidden" }}
            >
              <header style={{ alignItems: "center", display: "flex", gap: "0.55rem", justifyContent: "space-between", padding: "0.75rem" }}>
                <button
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? -1 : index)}
                  style={{ background: "transparent", border: 0, color: "#26382e", cursor: "pointer", flex: 1, font: "inherit", fontSize: "0.82rem", fontWeight: 700, padding: 0, textAlign: "left" }}
                  type="button"
                >
                  第{index + 1}天｜{day.route || day.title || "新增一天"}
                </button>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button aria-label="上移" disabled={index === 0} onClick={() => moveDay(index, index - 1)} style={secondaryButton} type="button">上移</button>
                  <button aria-label="下移" disabled={index === days.length - 1} onClick={() => moveDay(index, index + 1)} style={secondaryButton} type="button">下移</button>
                </div>
              </header>

              {isOpen ? (
                <div style={{ borderTop: "1px solid #e3ded1", display: "grid", gap: "1rem", padding: "1rem" }}>
                  <label style={{ color: "#334155", display: "grid", fontSize: "0.78rem", fontWeight: 650, gap: "0.35rem" }}>
                    <span>当日标题（英文）</span>
                    <input onChange={(event) => updateDay(index, (entry) => ({ ...entry, title: event.target.value }))} style={controlStyle} value={day.title ?? ""} />
                  </label>

                  <label style={{ color: "#334155", display: "grid", fontSize: "0.78rem", fontWeight: 650, gap: "0.35rem" }}>
                    <span>交通与住宿（英文）</span>
                    <small style={{ color: "#718077", fontSize: "0.7rem", fontWeight: 400 }}>例如：Lijiang → Luoguqing · Approx. 3 hours · Overnight in Luoguqing</small>
                    <textarea onChange={(event) => updateDay(index, (entry) => ({ ...entry, logistics: event.target.value }))} rows={3} style={{ ...controlStyle, lineHeight: 1.5, resize: "vertical" }} value={dayLogistics(day)} />
                  </label>

                  <label style={{ color: "#334155", display: "grid", fontSize: "0.78rem", fontWeight: 650, gap: "0.35rem" }}>
                    <span>每日正文（英文）</span>
                    <small style={{ color: "#718077", fontSize: "0.7rem", fontWeight: 400 }}>可以一次粘贴完整内容；段落之间留一个空行。</small>
                    <textarea onChange={(event) => updateDay(index, (entry) => ({ ...entry, paragraphs: paragraphLines(event.target.value) }))} rows={9} style={{ ...controlStyle, lineHeight: 1.6, resize: "vertical" }} value={paragraphs(day.paragraphs)} />
                  </label>

                  <section style={{ borderTop: "1px solid #e3ded1", display: "grid", gap: "0.85rem", paddingTop: "1rem" }}>
                    <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ color: "#334155", fontSize: "0.8rem", fontWeight: 700, margin: 0 }}>当日图片</p>
                        <p style={{ color: "#718077", fontSize: "0.69rem", margin: "0.2rem 0 0" }}>建议每一天使用 1–6 张图片；可继续添加，并使用按钮调整顺序。</p>
                      </div>
                      <button
                        onClick={() => updateDay(index, (entry) => ({ ...entry, images: [...(entry.images ?? []), { src: "", alt: "", displayRatio: "original", focalPoint: "center" }], mediaLayout: entry.mediaLayout === "text-only" ? "image-right" : entry.mediaLayout }))}
                        style={secondaryButton}
                        type="button"
                      >
                        添加图片
                      </button>
                    </div>

                    {images.map((image, imageIndex) => (
                      <article key={`day-image-${imageIndex}`} style={{ background: "#fff", border: "1px solid #dedbd2", borderRadius: "0.45rem", padding: "0.8rem" }}>
                        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: "0.65rem" }}>
                          <strong style={{ color: "#526158", fontSize: "0.74rem" }}>图片 {imageIndex + 1}</strong>
                          <div style={{ display: "flex", gap: "0.35rem" }}>
                            <button disabled={imageIndex === 0} onClick={() => updateDay(index, (entry) => { const next = [...(entry.images ?? [])]; [next[imageIndex - 1], next[imageIndex]] = [next[imageIndex], next[imageIndex - 1]]; return { ...entry, images: next }; })} style={secondaryButton} type="button">前移</button>
                            <button disabled={imageIndex === images.length - 1} onClick={() => updateDay(index, (entry) => { const next = [...(entry.images ?? [])]; [next[imageIndex], next[imageIndex + 1]] = [next[imageIndex + 1], next[imageIndex]]; return { ...entry, images: next }; })} style={secondaryButton} type="button">后移</button>
                            <button onClick={() => { if (window.confirm("确定删除这张图片吗？图片文件本身不会从图片库删除。")) updateDay(index, (entry) => ({ ...entry, images: (entry.images ?? []).filter((_, itemIndex) => itemIndex !== imageIndex) })); }} style={{ ...secondaryButton, color: "#8a3d34" }} type="button">移除</button>
                          </div>
                        </div>
                        <ImageSourceField path={`${input.name}.${index}.images.${imageIndex}.src`} />
                        <ChoiceCards
                          choices={ratioChoices}
                          label="图片显示比例"
                          onChange={(value) => updateDay(index, (entry) => ({ ...entry, images: (entry.images ?? []).map((item, itemIndex) => itemIndex === imageIndex ? { ...item, displayRatio: value, legacyAspect: undefined } : item) }))}
                          value={image.displayRatio ?? "original"}
                        />
                        {!ratioChoices.some(([value]) => value === image.displayRatio) && image.displayRatio ? (
                          <p style={{ background: "#f6f0e2", color: "#6e6043", fontSize: "0.7rem", lineHeight: 1.45, padding: "0.55rem" }}>当前保留已上线的旧版比例；只有主动选择新比例后才会改变。</p>
                        ) : null}
                        <details style={{ marginTop: "0.75rem" }}>
                          <summary style={{ color: "#53655a", cursor: "pointer", fontSize: "0.72rem", fontWeight: 650 }}>高级：图片英文说明与画面重点</summary>
                          <div style={{ display: "grid", gap: "0.7rem", marginTop: "0.65rem" }}>
                            <label style={{ color: "#526158", display: "grid", fontSize: "0.72rem", gap: "0.3rem" }}>
                              图片英文说明（SEO/无障碍，不显示为网页标题）
                              <textarea onChange={(event) => updateDay(index, (entry) => ({ ...entry, images: (entry.images ?? []).map((item, itemIndex) => itemIndex === imageIndex ? { ...item, alt: event.target.value } : item) }))} rows={2} style={{ ...controlStyle, resize: "vertical" }} value={image.alt ?? ""} />
                            </label>
                            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                              <legend style={{ color: "#526158", fontSize: "0.72rem", marginBottom: "0.35rem" }}>画面重点</legend>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                                {focalChoices.map(([value, label]) => <button key={value} onClick={() => updateDay(index, (entry) => ({ ...entry, images: (entry.images ?? []).map((item, itemIndex) => itemIndex === imageIndex ? { ...item, focalPoint: value } : item) }))} style={{ ...secondaryButton, background: image.focalPoint === value ? "#eef2eb" : "#fff" }} type="button">{label}</button>)}
                              </div>
                            </fieldset>
                          </div>
                        </details>
                      </article>
                    ))}

                    {images.length > 0 ? (
                      <>
                        <ChoiceCards choices={layoutChoices} label="图片位置" onChange={(value) => updateDay(index, (entry) => applyLayout(entry, value))} value={selectedLayout} />
                        {selectedLayout === "legacy" ? <p style={{ background: "#f6f0e2", color: "#6e6043", fontSize: "0.7rem", lineHeight: 1.45, padding: "0.55rem" }}>当前保留已上线的旧版图片位置和大小；只有主动选择新位置后才会改变。</p> : null}
                      </>
                    ) : null}
                  </section>

                  <details style={{ borderTop: "1px solid #e3ded1", paddingTop: "0.85rem" }}>
                    <summary style={{ color: "#53655a", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700 }}>高级设置 → 当日补充内容</summary>
                    <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
                      {[
                        ["subtitle", "独立引言", day.subtitle ?? ""],
                        ["route", "独立路线", day.route ?? ""],
                        ["drive", "独立车程", day.drive ?? ""],
                        ["overnight", "独立住宿", day.overnight ?? ""],
                        ["note", "实用提醒", day.note ?? ""],
                      ].map(([key, label, value]) => (
                        <label key={key} style={{ color: "#526158", display: "grid", fontSize: "0.72rem", gap: "0.3rem" }}>
                          {label}（英文）
                          <input onChange={(event) => updateDay(index, (entry) => ({ ...entry, [key]: event.target.value }))} style={controlStyle} value={value} />
                        </label>
                      ))}
                      <label style={{ color: "#526158", display: "grid", fontSize: "0.72rem", gap: "0.3rem" }}>
                        今日体验（英文，每行一条）
                        <textarea onChange={(event) => updateDay(index, (entry) => ({ ...entry, experiences: cleanLines(event.target.value) }))} rows={4} style={{ ...controlStyle, resize: "vertical" }} value={lines(day.experiences)} />
                      </label>
                      <label style={{ color: "#526158", display: "grid", fontSize: "0.72rem", gap: "0.3rem" }}>
                        旧版图片大小
                        <select onChange={(event) => updateDay(index, (entry) => ({ ...entry, imageSize: event.target.value }))} style={controlStyle} value={day.imageSize ?? "standard"}>
                          <option value="compact">小图</option><option value="standard">标准图</option><option value="wide">大图</option>
                        </select>
                      </label>

                      <section style={{ borderTop: "1px dashed #d8d3c7", paddingTop: "0.75rem" }}>
                        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
                          <strong style={{ color: "#526158", fontSize: "0.74rem" }}>可选方案 A/B</strong>
                          <button onClick={() => updateDay(index, (entry) => ({ ...entry, options: [...(entry.options ?? []), { label: `Option ${String.fromCharCode(65 + (entry.options?.length ?? 0))}`, title: "", description: "", points: [] }] }))} style={secondaryButton} type="button">添加可选方案 A/B</button>
                        </div>
                        {(day.options ?? []).map((option, optionIndex) => (
                          <div key={optionIndex} style={{ background: "#fff", border: "1px solid #dedbd2", display: "grid", gap: "0.55rem", marginTop: "0.65rem", padding: "0.7rem" }}>
                            {[
                              ["label", "方案名称", option.label ?? ""],
                              ["title", "方案标题", option.title ?? ""],
                              ["description", "方案说明", option.description ?? ""],
                            ].map(([key, label, value]) => <label key={key} style={{ color: "#526158", display: "grid", fontSize: "0.7rem", gap: "0.25rem" }}>{label}<input onChange={(event) => updateDay(index, (entry) => ({ ...entry, options: (entry.options ?? []).map((item, itemIndex) => itemIndex === optionIndex ? { ...item, [key]: event.target.value } : item) }))} style={controlStyle} value={value} /></label>)}
                            <label style={{ color: "#526158", display: "grid", fontSize: "0.7rem", gap: "0.25rem" }}>方案体验（每行一条）<textarea onChange={(event) => updateDay(index, (entry) => ({ ...entry, options: (entry.options ?? []).map((item, itemIndex) => itemIndex === optionIndex ? { ...item, points: cleanLines(event.target.value) } : item) }))} rows={3} style={{ ...controlStyle, resize: "vertical" }} value={lines(option.points)} /></label>
                            <button onClick={() => { if (window.confirm("确定删除这个可选方案吗？")) updateDay(index, (entry) => ({ ...entry, options: (entry.options ?? []).filter((_, itemIndex) => itemIndex !== optionIndex) })); }} style={{ ...secondaryButton, color: "#8a3d34", justifySelf: "start" }} type="button">删除此方案</button>
                          </div>
                        ))}
                      </section>
                    </div>
                  </details>

                  <button
                    onClick={() => {
                      if (!window.confirm(`确定删除第${index + 1}天吗？此操作只影响当前路线。`)) return;
                      updateDays(days.filter((_, dayIndex) => dayIndex !== index));
                      setExpanded(Math.max(0, index - 1));
                    }}
                    style={{ ...secondaryButton, color: "#8a3d34", justifySelf: "start" }}
                    type="button"
                  >
                    删除这一天
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <button
        onClick={() => {
          const nextIndex = days.length;
          updateDays([...days, { day: nextIndex + 1, title: "", logistics: "", paragraphs: [], experiences: [], mediaLayout: "image-right", imageSize: "standard", images: [], options: [] }]);
          setExpanded(nextIndex);
        }}
        style={{ ...secondaryButton, background: "#355542", color: "#fff", marginTop: "0.85rem" }}
        type="button"
      >
        添加一天
      </button>

      {meta.touched && meta.error ? <p style={{ color: "#b42318", fontSize: "0.75rem" }}>{String(meta.error)}</p> : null}
    </section>
  );
}
