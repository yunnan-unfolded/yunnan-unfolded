import { homeCollection } from "./homeCollection";
import { travelGuideBodyField } from "../shared/travelGuideRichTextSchema";
import { defineConfig, type TinaField } from "tinacms";
import { normalizeJourneySlug } from "../shared/journeyDefaults.ts";
import { AdvancedSettingsField } from "./fields/AdvancedSettingsField";
import { HighlightsBulkField } from "./fields/HighlightsBulkField";
import { JourneyBasicsField } from "./fields/JourneyBasicsField";
import { JourneyDaysField } from "./fields/JourneyDaysField";
import { JourneyGalleryField } from "./fields/JourneyGalleryField";
import { JourneyImageField } from "./fields/JourneyImageField";
import { LinesListField } from "./fields/LinesListField";
import { PresetCardsField } from "./fields/PresetCardsField";
import { PublicationStatusField } from "./fields/PublicationStatusField";
import { WalkBasicsField } from "./fields/WalkBasicsField";
import { WalkImagePresetCardsField } from "./fields/WalkImagePresetCardsField";
import { WalkPublicationStatusField } from "./fields/WalkPublicationStatusField";
import { TravelGuidePublicationStatusField } from "./fields/TravelGuidePublicationStatusField";
import { TravelGuideTitleField } from "./fields/TravelGuideTitleField";
import { TravelGuideBodyField } from "./fields/TravelGuideBodyField";
import { withTravelGuideNavigation } from "./fields/TravelGuideGroupField";
import { prepareJourneyForSave } from "./journeySave";
import { prepareTravelGuideForSave } from "./travelGuideSave";
import { prepareWalkForSave } from "./walkSave";
import { normalizeTravelGuideSlug, TRAVEL_GUIDE_DEFAULT_ITEM } from "../shared/travelGuideDefaults.ts";
import { normalizeWalkSlug } from "../shared/walkDefaults.ts";

const text = (name: string, label: string, description?: string, searchable = true): TinaField => ({
  type: "string",
  name,
  label,
  description,
  searchable,
});

const textList = (name: string, label: string, description?: string, searchable = true): TinaField => ({
  type: "string",
  name,
  label,
  description,
  list: true,
  searchable,
  ui: { component: LinesListField as never },
});

const hiddenText = (name: string, searchable = false): TinaField => ({ type: "string", name, label: name, searchable, ui: { component: "hidden" } });
const hiddenNumber = (name: string): TinaField => ({ type: "number", name, label: name, searchable: false, ui: { component: "hidden" } });

function imageFields(includeDisplayControls = false): TinaField[] {
  return [
    {
      type: "image",
      name: "src",
      label: "选择或上传图片",
      description: "选择仓库中的图片，或上传一张新图片。路径会自动保存。",
      searchable: false,
      ui: { component: JourneyImageField },
    },
    text("alt", "图片英文说明", "用于 SEO 和无障碍，不会显示为网页图片标题。", false),
    ...(includeDisplayControls ? [
      {
        type: "string" as const,
        name: "displayRatio",
        label: "图片显示比例",
        options: ["original", "landscape-16-9", "landscape-4-3", "portrait-3-4", "portrait-9-16", "landscape", "portrait", "square"],
        searchable: false,
        ui: { component: PresetCardsField },
      },
      {
        type: "string" as const,
        name: "focalPoint",
        label: "画面重点",
        options: ["center", "top", "bottom", "left", "right"],
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

function walkImageFields(): TinaField[] {
  return [
    {
      type: "image",
      name: "src",
      label: "图片文件",
      description: "选择图片库中的文件，或上传使用唯一英文文件名的新图片。",
      searchable: false,
      ui: { component: JourneyImageField },
    },
    text("alt", "图片英文说明", "用于未来页面的 SEO 和无障碍，不会显示为图片标题。", false),
    {
      type: "string",
      name: "displayWidth",
      label: "显示宽度",
      options: ["standard", "large", "full-bleed", "half"],
      searchable: false,
      ui: { component: WalkImagePresetCardsField as never },
    },
    {
      type: "string",
      name: "displayRatio",
      label: "图片比例",
      options: ["original", "landscape-16-9", "landscape-4-3", "portrait-3-4", "portrait-9-16"],
      searchable: false,
      ui: { component: WalkImagePresetCardsField as never },
    },
    {
      type: "string",
      name: "alignment",
      label: "图片位置",
      options: ["center", "left", "right"],
      searchable: false,
      ui: { component: WalkImagePresetCardsField as never },
    },
    {
      type: "string",
      name: "focalPoint",
      label: "画面重点",
      options: ["center", "top", "bottom", "left", "right"],
      searchable: false,
      ui: { component: WalkImagePresetCardsField as never },
    },
    hiddenNumber("width"),
    hiddenNumber("height"),
  ];
}

const tinaSearchToken = process.env.TINA_SEARCH_TOKEN?.trim();

const config = defineConfig({
  branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "images/journeys", publicFolder: "public" } },
  search: {
    tina: { indexerToken: tinaSearchToken || "", stopwordLanguages: ["eng"] },
    maxSearchIndexFieldLength: 500,
  },
  schema: {
    collections: [homeCollection, {
      name: "journey",
      label: "精品行程",
      path: "content/journeys",
      format: "json",
      ui: {
        filename: {
          readonly: true,
          description: "文件名由系统根据页面网址自动生成，运营者无需填写。",
          slugify: (values) => normalizeJourneySlug(String(values?.basic?.slug || values?.title || "journey")) || "journey",
        },
        beforeSubmit: prepareJourneyForSave,
        allowedActions: { create: true, delete: true, createFolder: false, createNestedFolder: false },
      },
      defaultItem: {
        title: "",
        summary: "",
        basic: { slug: "", searchKeywords: [], durationDays: 0, durationNights: 0, travelStyle: "Private & Tailor-Made", activityLevel: "", bestSeasons: "", startLocation: "", endLocation: "", priceNote: "Tailored quotation" },
        hero: {},
        overview: { paragraphs: [], facts: [] },
        highlights: { items: [] },
        gallery: { images: [] },
        route: { display: "", stops: [] },
        itinerary: { days: [] },
        inclusions: { included: [], excluded: [] },
        audience: { suitable: [], considerations: [] },
        booking: { conditions: [] },
        seo: { keywords: [] },
        publication: { status: "draft" },
        advanced: { copy: { enabled: false }, hero: { enabled: false }, inquiry: { enabled: false } },
      },
      fields: [
        {
          type: "string",
          name: "title",
          label: "1. 基本信息",
          description: "路线名称是后台列表、页面和卡片的唯一默认标题。",
          required: true,
          isTitle: true,
          searchable: true,
          ui: { component: JourneyBasicsField as never },
        },
        hiddenText("summary", true),
        {
          type: "object",
          name: "basic",
          label: "基本信息数据",
          searchable: true,
          ui: { component: "hidden" },
          fields: [
            text("slug", "页面网址", undefined, false),
            { type: "number", name: "durationDays", label: "天数", searchable: false },
            { type: "number", name: "durationNights", label: "晚数", searchable: false },
            text("startLocation", "起点"),
            text("endLocation", "终点"),
            text("bestSeasons", "旅行季节"),
            text("activityLevel", "难度"),
            text("travelStyle", "旅行方式"),
            text("priceNote", "价格说明", undefined, false),
            textList("searchKeywords", "后台搜索关键词"),
            hiddenText("collection", true),
            hiddenText("listingDescription", true),
            hiddenText("homepageDescription"),
            hiddenText("homepageImageAlt"),
            hiddenText("title", true),
            hiddenText("subtitle", true),
            { type: "string", name: "heroFacts", label: "heroFacts", list: true, searchable: false, ui: { component: "hidden" } },
            { type: "string", name: "promises", label: "promises", list: true, searchable: false, ui: { component: "hidden" } },
            hiddenText("heroEyebrow"),
            hiddenText("inquiryEyebrow"),
            { type: "object", name: "inquiryFacts", label: "inquiryFacts", list: true, searchable: false, ui: { component: "hidden" }, fields: [hiddenText("label"), hiddenText("value")] },
            hiddenText("inquiryPromise"),
          ],
        },
        { type: "object", name: "hero", label: "Hero 数据", searchable: false, ui: { component: "hidden" }, fields: imageFields(false) },
        {
          type: "object",
          name: "overview",
          label: "2. 行程概览",
          description: "用自然段介绍路线；固定品牌询盘文案由系统统一提供。",
          fields: [
            textList("paragraphs", "行程概览（英文，每段之间换行）"),
            {
              type: "object",
              name: "seasonNote",
              label: "季节说明（选填）",
              description: "适合说明花期、雨季或其他会随日期和天气变化的体验。留空时前台不会显示。",
              fields: [
                text("title", "提示标题（英文）"),
                { type: "string", name: "body", label: "提示正文（英文）", searchable: true, ui: { component: "textarea" } },
              ],
            },
            { type: "object", name: "facts", label: "概览信息表", list: true, ui: { itemProps: (item) => ({ label: String((item as { label?: string }).label || "新增信息") }), defaultItem: { label: "", value: "" } }, fields: [text("label", "名称（英文）"), text("value", "内容（英文）")] },
            { type: "object", name: "finalCta", label: "旧版结尾询盘文案", searchable: false, ui: { component: "hidden" }, fields: [hiddenText("eyebrow"), hiddenText("title"), hiddenText("body"), hiddenText("primaryLabel"), hiddenText("secondaryLabel")] },
          ],
        },
        {
          type: "object",
          name: "highlights",
          label: "3. 行程亮点",
          description: "每行一条，适合一次粘贴和调整顺序。",
          fields: [
            { type: "object", name: "items", label: "行程亮点（每行一条）", list: true, searchable: true, ui: { component: HighlightsBulkField as never, defaultItem: { title: "", description: "" } }, fields: [text("title", "亮点"), text("description", "详细说明")] },
            { type: "object", name: "images", label: "旧版亮点图片", list: true, searchable: false, ui: { component: "hidden" }, fields: imageFields(false) },
          ],
        },
        {
          type: "object",
          name: "itinerary",
          label: "4. 每日行程",
          description: "日常只填写标题、交通与住宿、正文和图片。",
          fields: [{
            type: "object",
            name: "days",
            label: "每日安排",
            list: true,
            searchable: true,
            ui: { component: JourneyDaysField as never, defaultItem: { day: 1, title: "", logistics: "", paragraphs: [], experiences: [], mediaLayout: "image-right", imageSize: "standard", images: [], options: [] } },
            fields: [
              hiddenNumber("day"),
              text("title", "当日标题"),
              text("logistics", "交通与住宿"),
              text("route", "独立路线"),
              text("drive", "独立车程"),
              text("overnight", "独立住宿"),
              text("subtitle", "独立引言"),
              textList("paragraphs", "每日正文"),
              textList("experiences", "今日体验"),
              text("note", "实用提醒"),
              { type: "string", name: "mediaLayout", label: "图片位置", options: ["text-only", "image-left", "image-right", "image-above", "image-below", "two-images"], searchable: false },
              { type: "string", name: "imageSize", label: "旧版图片大小", options: ["compact", "standard", "wide"], searchable: false },
              { type: "object", name: "images", label: "当日图片", list: true, searchable: false, ui: { defaultItem: { src: "", alt: "", displayRatio: "original", focalPoint: "center" } }, fields: imageFields(true) },
              { type: "object", name: "options", label: "可选方案 A/B", list: true, searchable: true, ui: { max: 4, defaultItem: { label: "Option A", title: "", description: "", points: [] } }, fields: [text("label", "方案名称", undefined, false), text("title", "方案标题"), text("description", "方案说明"), textList("points", "方案体验")] },
            ],
          }],
        },
        { type: "object", name: "inclusions", label: "5. 包含与不包含", description: "每行一条。", fields: [textList("included", "费用包含（英文）"), textList("excluded", "费用不包含（英文）")] },
        { type: "object", name: "audience", label: "6. 适合人群", description: "说明适合谁，以及需要提前了解的体力或季节条件。", fields: [textList("suitable", "适合人群（英文）"), textList("considerations", "注意事项（英文）")] },
        { type: "object", name: "gallery", label: "7. 图片", description: "路线亮点区域使用的图片；可按内容需要继续添加。", fields: [{ type: "object", name: "images", label: "路线图片", list: true, searchable: false, ui: { component: JourneyGalleryField as never, defaultItem: { src: "", alt: "" } }, fields: imageFields(false) }] },
        { type: "object", name: "route", label: "路线数据", searchable: true, ui: { component: "hidden" }, fields: [text("display", "路线概览"), { type: "object", name: "stops", label: "路线节点", list: true, fields: [text("place", "地点"), text("days", "时间范围", undefined, false)] }] },
        { type: "object", name: "booking", label: "预订条件数据", searchable: false, ui: { component: "hidden" }, fields: [textList("conditions", "预订条件", undefined, false)] },
        { type: "object", name: "seo", label: "搜索数据", searchable: false, ui: { component: "hidden" }, fields: [text("title", "SEO Title", undefined, false), text("description", "Meta description", undefined, false), textList("keywords", "SEO keywords", undefined, false), { type: "object", name: "ogImage", label: "OG 图片", searchable: false, fields: imageFields(false) }] },
        {
          type: "object",
          name: "publication",
          label: "8. 保存与发布",
          description: "草稿不会出现在网站；发布前系统会检查路线名称、简介、首图和每日行程。",
          fields: [{ type: "string", name: "status", label: "当前状态", required: true, searchable: false, options: [{ label: "草稿", value: "draft" }, { label: "已发布", value: "published" }], ui: { component: PublicationStatusField } }],
        },
        {
          type: "object",
          name: "advanced",
          label: "9. 高级设置",
          description: "通常无需修改。",
          searchable: false,
          ui: { component: AdvancedSettingsField as never },
          fields: [
            { type: "object", name: "copy", label: "自定义页面文字", searchable: false, fields: [{ type: "boolean", name: "enabled", label: "启用" }, text("pageTitle", "页面 H1", undefined, false), text("pageSubtitle", "页面副标题", undefined, false), text("homepageDescription", "首页简介", undefined, false), text("homepageImageAlt", "首页图片说明", undefined, false)] },
            { type: "object", name: "hero", label: "Hero 自定义", searchable: false, fields: [{ type: "boolean", name: "enabled", label: "启用" }, text("eyebrow", "首图短标题", undefined, false), textList("facts", "首图关键词", undefined, false), text("imageAlt", "Hero 图片说明", undefined, false)] },
            { type: "object", name: "inquiry", label: "自定义询盘文案", searchable: false, fields: [
              { type: "boolean", name: "enabled", label: "启用" },
              textList("promises", "服务承诺", undefined, false),
              text("eyebrow", "询盘短标题", undefined, false),
              { type: "object", name: "facts", label: "询盘信息", list: true, searchable: false, fields: [text("label", "名称", undefined, false), text("value", "内容", undefined, false)] },
              text("promise", "回复说明", undefined, false),
              { type: "object", name: "finalCta", label: "结尾询盘", searchable: false, fields: [text("eyebrow", "短标题", undefined, false), text("title", "主标题", undefined, false), text("body", "正文", undefined, false), text("primaryLabel", "主要按钮", undefined, false), text("secondaryLabel", "次要按钮", undefined, false)] },
            ] },
          ],
        },
      ],
    }, {
      name: "walk",
      label: "徒步路线",
      path: "content/walks",
      format: "json",
      ui: {
        filename: {
          readonly: true,
          description: "文件名由页面网址自动生成，运营者无需填写。",
          slugify: (values) => normalizeWalkSlug(String(values?.basic?.slug || values?.title || "new-walk")) || "new-walk",
        },
        beforeSubmit: prepareWalkForSave,
        allowedActions: { create: true, delete: true, createFolder: false, createNestedFolder: false },
      },
      defaultItem: {
        title: "",
        basic: {
          slug: "",
          region: "",
          summary: "",
          difficulty: "gentle",
          approximateDuration: "",
          recommendedSeasons: "",
          searchKeywords: [],
        },
        hero: { src: "", alt: "" },
        route: { introduction: "", options: [], stages: [] },
        gallery: { images: [] },
        practical: { seasonNote: "", location: "", accessNote: "", signalNote: "", preparationNotes: [], relatedJourney: "" },
        seo: { title: "", description: "" },
        publication: { status: "draft" },
      },
      fields: [
        {
          type: "string",
          name: "title",
          label: "1. 基本信息",
          description: "填写路线名称、地区、列表介绍、难度、时长和季节。",
          required: true,
          isTitle: true,
          searchable: true,
          ui: { component: WalkBasicsField as never },
        },
        {
          type: "object",
          name: "basic",
          label: "基本信息数据",
          searchable: true,
          ui: { component: "hidden" },
          fields: [
            text("slug", "页面网址", undefined, false),
            text("region", "所在地区"),
            text("summary", "列表简短介绍"),
            { type: "string", name: "difficulty", label: "徒步难度", options: ["gentle", "easy-moderate", "high-country"], searchable: true },
            text("approximateDuration", "大约时长"),
            text("recommendedSeasons", "推荐季节"),
            textList("searchKeywords", "后台搜索关键词"),
          ],
        },
        {
          type: "object",
          name: "hero",
          label: "2. 首图",
          description: "上传路线首图并填写英文说明。版式由未来页面模板统一控制。",
          searchable: false,
          fields: imageFields(false),
        },
        {
          type: "object",
          name: "route",
          label: "3. 路线介绍",
          description: "先填写整体介绍，再按实际行走过程增加、删除或拖动路线阶段。阶段不是固定的 Day 1、Day 2。",
          searchable: true,
          fields: [
            { type: "string", name: "introduction", label: "路线整体介绍（英文，发布必填）", searchable: true, ui: { component: "textarea" } },
            {
              type: "object",
              name: "options",
              label: "路线方案与攻略数据",
              description: "用于比较同一区域的不同走法。没有可靠数据的项目可以留空，前台会自动隐藏。",
              list: true,
              searchable: true,
              ui: {
                defaultItem: { title: "", summary: "", routeType: "out-and-back", riskLevel: "lower", riskNotes: [] },
                itemProps: (item) => ({ label: String((item as { title?: string }).title || "新增路线方案") }),
              },
              fields: [
                text("title", "方案名称（英文）"),
                { type: "string", name: "summary", label: "简短说明（英文）", searchable: true, ui: { component: "textarea" } },
                { type: "number", name: "distanceKm", label: "距离（公里）", searchable: false },
                text("duration", "预计时长（英文）", "如 2–3 hours；没有可靠数据时留空。"),
                { type: "string", name: "routeType", label: "路线类型", options: [{ label: "原路往返", value: "out-and-back" }, { label: "环线", value: "loop" }, { label: "穿越路线", value: "point-to-point" }], searchable: false },
                { type: "number", name: "startElevationM", label: "起点海拔（米）", searchable: false },
                { type: "number", name: "highestElevationM", label: "最高海拔（米）", searchable: false },
                { type: "number", name: "elevationGainM", label: "累计爬升（米）", searchable: false },
                { type: "string", name: "riskLevel", label: "风险等级", options: [{ label: "较低", value: "lower" }, { label: "中等", value: "moderate" }, { label: "较高", value: "high" }], searchable: false },
                { type: "string", name: "terrain", label: "主要路面（英文）", searchable: true, ui: { component: "textarea" } },
                { type: "string", name: "suitability", label: "适合人群（英文）", searchable: true, ui: { component: "textarea" } },
                textList("riskNotes", "路况与风险提示（英文，每行一条）", "只写已确认的实际风险。"),
              ],
            },
            {
              type: "object",
              name: "stages",
              label: "路线阶段列表",
              description: "可自由增加、删除和拖动排序；每个阶段的图片数量不限。",
              list: true,
              searchable: true,
              ui: {
                defaultItem: { title: "", body: "", images: [] },
                itemProps: (item) => ({ label: String((item as { title?: string }).title || "新增路线阶段") }),
              },
              fields: [
                text("title", "阶段标题（英文）"),
                { type: "string", name: "body", label: "阶段正文（英文）", searchable: true, ui: { component: "textarea" } },
                {
                  type: "object",
                  name: "images",
                  label: "本阶段图片",
                  description: "数量不限，可拖动排序；每张图片可独立设置版式。",
                  list: true,
                  searchable: false,
                  ui: {
                    defaultItem: { src: "", alt: "", displayWidth: "standard", displayRatio: "original", alignment: "center", focalPoint: "center" },
                    itemProps: (item) => ({ label: String((item as { alt?: string }).alt || "新增图片") }),
                  },
                  fields: walkImageFields(),
                },
              ],
            },
          ],
        },
        {
          type: "object",
          name: "gallery",
          label: "4. 路线图片",
          description: "管理不属于单个阶段、但可供未来详情页使用的路线图片。数量不限，可拖动排序。",
          searchable: false,
          fields: [{
            type: "object",
            name: "images",
            label: "路线图片",
            list: true,
            searchable: false,
            ui: {
              defaultItem: { src: "", alt: "", displayWidth: "standard", displayRatio: "original", alignment: "center", focalPoint: "center" },
              itemProps: (item) => ({ label: String((item as { alt?: string }).alt || "新增图片") }),
            },
            fields: walkImageFields(),
          }],
        },
        {
          type: "object",
          name: "practical",
          label: "5. 实用信息",
          description: "补充季节变化、出发前须知，并可关联现有精品行程。",
          fields: [
            text("location", "地理位置（英文，可选）", "填写到县、乡镇或景区层级，不公开敏感路线入口。"),
            { type: "string", name: "accessNote", label: "到达方式（英文，可选）", searchable: true, ui: { component: "textarea" } },
            { type: "string", name: "signalNote", label: "通信与路线提醒（英文，可选）", searchable: true, ui: { component: "textarea" } },
            { type: "string", name: "seasonNote", label: "季节说明（英文，可选）", searchable: true, ui: { component: "textarea" } },
            textList("preparationNotes", "出发前须知（英文，每行一条）", "可以一次粘贴多行，保存时会自动拆分。"),
            { type: "reference", name: "relatedJourney", label: "相关精品行程（可选）", collections: ["journey"], searchable: false },
          ],
        },
        {
          type: "object",
          name: "seo",
          label: "高级设置数据",
          searchable: false,
          ui: { component: "hidden" },
          fields: [text("title", "SEO 标题", undefined, false), text("description", "SEO 描述", undefined, false)],
        },
        {
          type: "object",
          name: "publication",
          label: "6. 保存与发布",
          description: "新建路线默认保存为草稿；只有发布时才检查所有发布必填内容。",
          fields: [{
            type: "string",
            name: "status",
            label: "当前状态",
            options: [{ label: "草稿", value: "draft" }, { label: "已发布", value: "published" }],
            searchable: false,
            ui: { component: WalkPublicationStatusField as never },
          }],
        },
      ],
    }, {
      name: "travelGuide",
      label: "旅行攻略",
      path: "content/travel-guides",
      format: "json",
      ui: {
        filename: {
          readonly: true,
          description: "文件名由页面网址自动生成，运营者无需填写。",
          slugify: (values) => normalizeTravelGuideSlug(String(values?.basic?.slug || values?.title || "new-guide")) || "new-guide",
        },
        beforeSubmit: prepareTravelGuideForSave,
        allowedActions: { create: true, delete: true, createFolder: false, createNestedFolder: false },
      },
      defaultItem: TRAVEL_GUIDE_DEFAULT_ITEM,
      fields: withTravelGuideNavigation([
        {
          type: "string",
          name: "editorLabel",
          label: "内部编辑标题",
          description: "仅供后台识别文档，公开页面不会使用。",
          required: true,
          isTitle: true,
          searchable: false,
          ui: { component: "hidden" },
        },
        {
          type: "string",
          name: "title",
          label: "1. 标题（英文）",
          description: "攻略标题用于后台列表、未来详情页和默认搜索标题；创建草稿时需要填写。",
          searchable: true,
          ui: { component: TravelGuideTitleField as never },
        },
        {
          type: "object",
          name: "basic",
          label: "2. 分类与摘要",
          description: "填写分类、可选地区和目录页使用的简短摘要。",
          searchable: true,
          fields: [
            text("slug", "页面网址", "英文标题可自动生成网址；中文标题请填写英文网址，例如 yunnan-travel-guide。", false),
            text("category", "分类（英文）"),
            text("region", "地区（英文，可选）"),
            { type: "string", name: "summary", label: "简短摘要（英文）", searchable: true, ui: { component: "textarea" } },
          ],
        },
        {
          type: "object",
          name: "hero",
          label: "3. 封面图（用于攻略目录和文章顶部）",
          description: "建议上传清晰横图。目录卡片会自动按 4:3 裁切，可通过焦点位置调整主体。",
          searchable: false,
          fields: walkImageFields(),
        },
        {
          type: "object",
          name: "content",
          label: "旧正文（只读兼容）",
          ui: { component: "hidden" },
          description: "填写开场介绍，并按内容需要添加可排序的正文区块。",
          searchable: true,
          fields: [
            { type: "string", name: "introduction", label: "开场介绍（英文）", searchable: true, ui: { component: "textarea" } },
            {
              type: "object",
              name: "sections",
              label: "正文区块",
              list: true,
              searchable: true,
              ui: {
                defaultItem: { heading: "", body: "", images: [] },
                itemProps: (item) => ({ label: String((item as { heading?: string }).heading || "新增正文区块") }),
              },
              fields: [
                text("heading", "区块标题（英文）"),
                { type: "string", name: "body", label: "区块正文（英文）", searchable: true, ui: { component: "textarea" } },
                {
                  type: "object",
                  name: "images",
                  label: "区块图片",
                  description: "数量不限，可拖动排序；每张图片可以单独设置比例、位置和画面重点。",
                  list: true,
                  searchable: false,
                  ui: {
                    defaultItem: { src: "", alt: "", displayWidth: "standard", displayRatio: "original", alignment: "center", focalPoint: "center" },
                    itemProps: (item) => ({ label: String((item as { alt?: string }).alt || "新增图片") }),
                  },
                  fields: walkImageFields(),
                },
              ],
            },
          ],
        },
        { ...travelGuideBodyField, ui: { component: TravelGuideBodyField as never } },
        {
          type: "object",
          name: "seo",
          label: "5. 搜索展示设置",
          description: "选填。留空时以后由攻略标题和简短摘要自动生成。",
          searchable: false,
          fields: [
            text("title", "SEO 标题（英文，可选）", "建议不超过约 60 个英文字符。", false),
            { type: "string", name: "description", label: "SEO 描述（英文，可选）", description: "建议约 140–160 个英文字符。", searchable: false, ui: { component: "textarea" } },
          ],
        },
        {
          type: "object",
          name: "publication",
          label: "6. 保存与发布",
          description: "新建攻略默认为草稿；只有发布时才检查标题、摘要、首图和正文。",
          fields: [{
            type: "string",
            name: "status",
            label: "当前状态",
            options: [{ label: "草稿", value: "draft" }, { label: "已发布", value: "published" }],
            searchable: false,
            ui: { component: TravelGuidePublicationStatusField as never },
          }],
        },
      ]),
    }],
  },
});

export default config;
