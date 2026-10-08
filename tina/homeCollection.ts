import { HomeImageField } from "./fields/HomeImageField";
import { HomeCollectionHelp } from "./fields/HomeCollectionHelp";
import type { Collection, TinaField } from "tinacms";

function slideField(name: string, label: string): TinaField {
  return {
    type: "object", name, label,
    fields: [
      { type: "image", name: "desktopSrc", label: "桌面图片", required: true, ui: { component: HomeImageField } },
      { type: "image", name: "mobileSrc", label: "手机图片（可选）", description: "留空时，手机和桌面响应式显示同一张桌面图片。", ui: { component: HomeImageField } },
      { type: "string", name: "alt", label: "英文图片说明", required: true },
      { type: "string", name: "place", label: "英文地点标签", ui: { component: "hidden" } },
    ],
  };
}

function cardImage(name: string, label: string): TinaField {
  return { type: "object", name, label, fields: [
    { type: "image", name: "src", label: "图片", required: true, ui: { component: HomeImageField } },
    { type: "string", name: "alt", label: "英文图片说明", required: true },
  ] };
}

function sectionImage(name: string, label: string): TinaField {
  return {
    type: "object", name, label,
    fields: [
      { type: "image", name: "src", label: "图片", required: true, ui: { component: HomeImageField } },
      { type: "string", name: "alt", label: "英文图片说明", required: true },
      { type: "string", name: "focalPoint", label: "焦点位置（可选）", description: "图片按现有区域裁切。留空保留原有构图；仅需要调整裁切重点时选择。", options: [
        { label: "居中", value: "center" }, { label: "靠上", value: "top" },
        { label: "靠下", value: "bottom" }, { label: "靠左", value: "left" }, { label: "靠右", value: "right" },
      ] },
    ],
  };
}

export const homeCollection: Collection = {
  name: "home",
  label: "首页图片",
  path: "content/home",
  format: "json",
  match: { include: "home" },
  ui: { allowedActions: { create: false, delete: false }, router: () => "/" },
  fields: [
    { type: "string", name: "title", label: "配置名称", isTitle: true, required: true, ui: { component: "hidden" } },
    slideField("first", "1. 首屏图片"),
    slideField("second", "2. 轮播图片"),
    slideField("third", "3. 轮播图片"),
    sectionImage("introduction", "4. Another side of Yunnan 区域图片"),
    sectionImage("inquiry", "5. 首页咨询区域背景图片"),
    { type: "string", name: "journeyCardsHelp", label: "6. Journey 卡片图片", description: "已发布行程的卡片封面请到「精品行程」集合，打开对应行程，在「1. 基本信息」中的「Hero 图片」更换。首页不重复维护。下面两张示例卡片只在首页维护图片，标题、文案和链接保持不变。", ui: { component: HomeCollectionHelp } },
    cardImage("oldRoads", "7. The Old Roads of Yunnan 卡片图片"),
    cardImage("southGreen", "8. South into the Green 卡片图片"),
    sectionImage("walkBanner", "9. Walk Yunnan 区域背景图片"),
    { type: "string", name: "walkCardsHelp", label: "10. Walk 卡片图片", description: "请到「徒步路线」集合，打开对应路线，在「2. 首图」分组更换。首页直接读取该路线的首图，不需要在这里再上传。", ui: { component: HomeCollectionHelp } },
    { type: "string", name: "guideCardsHelp", label: "11. Travel Guide 卡片图片", description: "请到「旅行攻略」集合，打开对应攻略，在「3. 封面图（用于攻略目录和文章顶部）」分组更换。首页直接读取攻略封面及焦点，不再使用固定的首页图片映射。", ui: { component: HomeCollectionHelp } },
    sectionImage("chloe", "12. Meet Chloe 人物图片"),
  ],
};
