import { HomeImageField } from "./fields/HomeImageField";
import type { Collection, TinaField } from "tinacms";

function slideField(name: string, label: string): TinaField {
  return {
    type: "object", name, label,
    fields: [
      { type: "image", name: "desktopSrc", label: "桌面图片", required: true, ui: { component: HomeImageField } },
      { type: "image", name: "mobileSrc", label: "手机图片（可选）", description: "留空时，手机和桌面响应式显示同一张桌面图片。", ui: { component: HomeImageField } },
      { type: "string", name: "alt", label: "英文图片说明", required: true },
      { type: "string", name: "place", label: "英文地点标签", required: true },
    ],
  };
}

export const homeCollection: Collection = {
  name: "home",
  label: "首页轮播图片",
  path: "content/home",
  format: "json",
  match: { include: "home" },
  ui: { allowedActions: { create: false, delete: false }, router: () => "/" },
  fields: [
    { type: "string", name: "title", label: "配置名称", isTitle: true, required: true, ui: { component: "hidden" } },
    slideField("first", "1. 首屏图片"),
    slideField("second", "2. 轮播图片"),
    slideField("third", "3. 轮播图片"),
  ],
};
