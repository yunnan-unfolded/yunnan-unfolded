import { defineConfig, type TinaField } from "tinacms";
import { JourneyImageField } from "./fields/JourneyImageField";
import { PresetCardsField } from "./fields/PresetCardsField";
import { PublicationStatusField } from "./fields/PublicationStatusField";
import { prepareJourneyForSave } from "./journeySave";

const text = (name: string, label: string, description?: string, isRequired = false, searchable = true): TinaField => ({
  type: "string",
  name,
  label: isRequired ? `${label}（必填）` : label,
  description: isRequired ? `${description ? `${description} ` : ""}发布前必填。` : description,
  required: false,
  searchable,
});

const textList = (name: string, label: string, description?: string, searchable = true): TinaField => ({
  type: "string",
  name,
  label,
  description,
  list: true,
  searchable,
  ui: { component: "textarea" },
});

const hiddenNumber = (name: string): TinaField => ({ type: "number", name, label: name, searchable: false, ui: { component: "hidden" } });
const hiddenText = (name: string): TinaField => ({ type: "string", name, label: name, searchable: false, ui: { component: "hidden" } });

function imageFields(includeDisplayControls = false): TinaField[] {
  return [
    {
      type: "image",
      name: "src",
      label: "上传图片",
      description: "选择仓库中的现有图片，或上传一张新图片。路径会自动保存。",
      searchable: false,
      ui: { component: JourneyImageField },
    },
    text("alt", "图片英文说明", "用于搜索引擎和无障碍读屏，不会在网页上显示为图片标题，也不是图片库搜索标签。请使用具体英文描述，不要写 image、photo 或堆砌关键词。", true, false),
    ...(includeDisplayControls ? [
      {
        type: "string" as const,
        name: "displayRatio",
        label: "图片比例",
        description: "选择页面中的呈现形状；选择“自动”时保留原图比例。",
        options: ["landscape", "portrait", "square", "original"],
        searchable: false,
        ui: { component: PresetCardsField },
      },
      {
        type: "string" as const,
        name: "focalPoint",
        label: "画面重点",
        description: "裁切图片时优先保留人物、山峰或建筑所在的位置。",
        options: ["top", "center", "bottom", "left", "right"],
        searchable: false,
        ui: { component: PresetCardsField },
      },
    ] : []),
    hiddenNumber("width"),
    hiddenNumber("height"),
    hiddenText("position"),
    hiddenText("directoryPosition"),
    hiddenText("directoryMobilePosition"),
    hiddenText("legacyAspect"),
  ];
}

const tinaSearchToken = process.env.TINA_SEARCH_TOKEN?.trim();
const hasSearchToken = Boolean(tinaSearchToken);
const searchUiEnabled = process.env.TINA_PUBLIC_SEARCH_ENABLED === "true";

const config = defineConfig({
  branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "images/journeys", publicFolder: "public" } },
  ...((hasSearchToken || searchUiEnabled) ? {
    search: {
      tina: {
        // The browser only needs the search configuration to exist. The real
        // indexer token is available to the Tina CLI on the server and is
        // deliberately replaced by an empty, non-credential value in the
        // public admin bundle.
        indexerToken: tinaSearchToken || "",
        stopwordLanguages: ["eng"],
      },
      maxSearchIndexFieldLength: 500,
    },
  } : {}),
  schema: {
    collections: [{
      name: "journey",
      label: "精品行程",
      path: "content/journeys",
      format: "json",
      ui: {
        filename: {
          readonly: true,
          description: "页面文件名由系统根据路线名称自动生成，日常编辑无需操作。",
          slugify: (values) => values?.basic?.slug || String(values?.basic?.collection || "journey")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        },
        beforeSubmit: prepareJourneyForSave,
        allowedActions: { create: true, delete: true, createFolder: false, createNestedFolder: false },
      },
      defaultItem: {
        basic: { slug: "", collection: "", searchKeywords: [], durationDays: 0, durationNights: 0 },
        hero: {}, overview: { paragraphs: [], facts: [], finalCta: {} }, highlights: { items: [], images: [] },
        route: { display: "", stops: [] }, itinerary: { days: [] }, audience: { suitable: [], considerations: [] },
        inclusions: { included: [], excluded: [] }, booking: { conditions: [] }, seo: {}, publication: { status: "draft" },
      },
      fields: [
        {
          type: "object", name: "basic", label: "1. 基本信息", description: "先填写路线名称、标题、天数和起终点。标有“必填”的内容在发布前必须完成。", fields: [
            text("collection", "路线名称（英文）", "例如：Yunnan, Slowly。后台会优先据此生成文件名。", true),
            text("listingDescription", "路线列表简介（英文）", "用于 Journeys 列表页。", true),
            text("homepageDescription", "首页卡片简介（英文）", "用于首页 Journey 卡片；留空时使用路线列表简介。"),
            text("homepageImageAlt", "首页图片英文说明", "留空时使用首图英文说明。", false, false),
            text("title", "页面标题（英文）", undefined, true),
            text("subtitle", "页面副标题（英文）", undefined, true),
            { type: "number", name: "durationDays", label: "行程天数", description: "保存时会根据“每日行程”自动计算。", searchable: false },
            { type: "number", name: "durationNights", label: "住宿晚数", searchable: false },
            text("startLocation", "起点（英文）", undefined, true),
            text("endLocation", "终点（英文）", undefined, true),
            textList("searchKeywords", "后台搜索关键词", "只用于后台查找，不会显示在网站页面，也不会影响搜索引擎。建议填写目的地、旅行主题和常用中英文名称，每行一个。"),
            text("travelStyle", "旅行方式（英文）", undefined, true),
            text("activityLevel", "活动强度（英文）", undefined, true),
            text("bestSeasons", "适合季节（英文）"),
            text("priceNote", "价格说明（英文）", undefined, true),
            text("heroEyebrow", "首图上方短标题（英文）", undefined, true),
            textList("heroFacts", "首图关键信息（英文）", "每行一条，例如天数、起终点和活动强度。"),
            textList("promises", "服务承诺（英文）", "每行一条。"),
            text("inquiryEyebrow", "询盘卡短标题（英文）", undefined, true, false),
            { type: "object", name: "inquiryFacts", label: "询盘卡信息", list: true, searchable: false, ui: { itemProps: (item) => ({ label: String((item as { label?: string }).label || "新增信息") }), defaultItem: { label: "", value: "" } }, fields: [text("label", "名称（英文）", undefined, true, false), text("value", "内容（英文）", undefined, true, false)] },
            text("inquiryPromise", "询盘回复承诺（英文）", undefined, true, false),
            text("slug", "页面网址（高级设置）", "通常无需修改，系统会根据英文路线名称自动生成。仅允许小写英文、数字和连字符。", true, false),
          ],
        },
        { type: "object", name: "hero", label: "2. 首图", description: "上传路线主图并填写准确的英文图片说明。", fields: imageFields(false) },
        { type: "object", name: "overview", label: "3. 行程概览", description: "填写页面开场介绍、关键信息和结尾询盘文案。", fields: [
          textList("paragraphs", "概览正文（英文）", "每行一段。"),
          { type: "object", name: "facts", label: "概览信息表", list: true, ui: { itemProps: (item) => ({ label: String((item as { label?: string }).label || "新增信息") }), defaultItem: { label: "", value: "" } }, fields: [text("label", "名称（英文）", undefined, true), text("value", "内容（英文）", undefined, true)] },
          { type: "object", name: "finalCta", label: "页面结尾询盘文案", searchable: false, fields: [text("eyebrow", "短标题（英文）", undefined, true, false), text("title", "主标题（英文）", undefined, true, false), text("body", "正文（英文）", undefined, true, false), text("primaryLabel", "主要按钮文字（英文）", undefined, true, false), text("secondaryLabel", "次要按钮文字（英文）", undefined, true, false)] },
        ] },
        { type: "object", name: "highlights", label: "4. 行程亮点", description: "用具体旅行场景说明这条路线最值得期待的体验。", fields: [
          { type: "object", name: "items", label: "亮点内容", list: true, ui: { itemProps: (item) => ({ label: String((item as { title?: string }).title || "新增亮点") }), defaultItem: { title: "", description: "" } }, fields: [text("title", "亮点标题（英文）", undefined, true), text("description", "亮点说明（英文）", undefined, true)] },
          { type: "object", name: "images", label: "亮点图片", list: true, ui: { max: 4, itemProps: (item) => ({ label: String((item as { alt?: string }).alt || "新增图片") }), defaultItem: { src: "", alt: "" } }, fields: imageFields(false) },
        ] },
        { type: "object", name: "route", label: "5. 路线节点", description: "按实际旅行顺序填写地点和对应天数。", fields: [
          text("display", "路线文字（英文）", "例如：Kunming → Weishan → Dali。", true),
          { type: "object", name: "stops", label: "路线节点", list: true, ui: { itemProps: (item) => ({ label: String((item as { place?: string }).place || "新增节点") }), defaultItem: { place: "", days: "" } }, fields: [text("place", "地点（英文）", undefined, true), text("days", "时间范围（英文）", undefined, true, false)] },
        ] },
        { type: "object", name: "itinerary", label: "6. 每日行程", description: "这里是最常用的编辑区。展开某一天即可修改文字、图片和版式。", fields: [{
          type: "object", name: "days", label: "每日安排", list: true,
          description: "添加新内容后可拖动排序。系统会在保存时自动重排天数，并在减少天数时再次确认。",
          ui: {
            itemProps: (item) => {
              const day = item as { day?: number; title?: string; route?: string };
              return { label: `第${day.day || "?"}天｜${day.route || day.title || "新增一天"}` };
            },
            defaultItem: {
              day: 1, title: "", subtitle: "", route: "", paragraphs: [""], experiences: [""], overnight: "",
              mediaLayout: "image-right", imageSize: "standard", images: [], options: [],
            },
          },
          fields: [
            { type: "number", name: "day", label: "第几天", required: true, searchable: false },
            text("title", "当日标题（英文）", undefined, true),
            text("route", "路线（英文）", undefined, true),
            text("drive", "车程（英文）", "没有行车安排时可以留空。"),
            text("overnight", "住宿地点（英文）", undefined, true),
            text("subtitle", "简短引言（英文）", "用于当天标题下方的一句介绍。", true),
            textList("paragraphs", "正文（英文）", "每行一段。"),
            textList("experiences", "今日体验（英文）", "每行一条。"),
            text("note", "实用提醒（英文）", "没有提醒时可以留空。"),
            { type: "string", name: "mediaLayout", label: "图文排列", description: "选择一个安全的响应式预设，手机端会自动变为上下排列。", options: ["text-only", "image-left", "image-right", "image-above", "image-below", "two-images"], searchable: false, ui: { component: PresetCardsField } },
            { type: "string", name: "imageSize", label: "图片大小", description: "只影响当前这一天，不会改变其他行程内容。", options: ["compact", "standard", "wide"], searchable: false, ui: { component: PresetCardsField } },
            { type: "object", name: "images", label: "图片（最多2张）", list: true, description: "点击添加后上传或替换图片，并填写英文图片说明。选择“双图并排”时需要两张图片。", ui: { max: 2, itemProps: (item) => ({ label: String((item as { alt?: string }).alt || "添加图片") }), defaultItem: { src: "", alt: "", displayRatio: "landscape", focalPoint: "center" } }, fields: imageFields(true) },
            { type: "object", name: "options", label: "可选方案 A/B", description: "只有当天确实存在不同选择时才添加。", list: true, ui: { max: 4, itemProps: (item) => { const value = item as { label?: string; title?: string }; return { label: `${value.label || "Option"}｜${value.title || "添加可选方案"}` }; }, defaultItem: { label: "Option A", title: "", description: "", points: [""] } }, fields: [text("label", "方案名称（英文）", "例如 Option A。", true, false), text("title", "方案标题（英文）", undefined, true), text("description", "方案说明（英文）", undefined, true), textList("points", "方案体验（英文）", "每行一条。") ] },
          ],
        }] },
        { type: "object", name: "audience", label: "7. 适合人群", description: "说明这条路线适合谁，以及需要提前了解的体力或季节条件。", fields: [
          textList("suitable", "适合人群与活动说明（英文）", "每行一条。"),
          textList("considerations", "实用考虑事项（英文）", "可选；例如海拔、步行强度或季节限制，每行一条。"),
        ] },
        { type: "object", name: "inclusions", label: "8. 费用包含与不包含", description: "分别列出报价通常包含和不包含的服务，每行一条。", fields: [textList("included", "费用包含（英文）", "每行一条。"), textList("excluded", "费用不包含（英文）", "每行一条。") ] },
        { type: "object", name: "booking", label: "9. 预订条件", description: "填写定金、取消、保险和最终确认等重要条件。", fields: [textList("conditions", "预订条件（英文）", "每行一条。") ] },
        { type: "object", name: "seo", label: "10. 搜索展示设置", description: "高级设置。通常留空即可，网站会自动使用路线标题、简介和首图。", fields: [
          text("title", "搜索结果标题（英文）", "建议不超过约60个英文字符；留空时自动使用页面标题和品牌名。", false, false),
          text("description", "搜索结果描述（英文）", "建议约140–160个英文字符；留空时自动使用路线列表简介。", false, false),
          { type: "object", name: "ogImage", label: "社交分享图（可选）", searchable: false, fields: imageFields(false) },
        ] },
        { type: "object", name: "publication", label: "11. 发布状态", description: "保存草稿不会公开；发布前系统会检查标题、天数、首图和页面网址。", fields: [{
          type: "string", name: "status", label: "当前状态", required: true, searchable: false,
          description: "Tina 顶部的原生 Save 按钮无法安全改名；日常操作优先使用这里的中文按钮。",
          options: [{ label: "草稿", value: "draft" }, { label: "已发布", value: "published" }],
          ui: { component: PublicationStatusField },
        }] },
      ],
    }],
  },
});

export default config;
