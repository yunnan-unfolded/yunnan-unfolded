# Phase 2.4D 本地试用记录

## 试用

- 后台：http://127.0.0.1:3000/admin/index.html#/collections/edit/travelGuide/how-to-pay-in-yunnan
- 前台：http://127.0.0.1:3000/travel-guides/how-to-pay-in-yunnan/
- 正文是一个连续的富文本区域。将光标放到段落之间，通过 **Embed → 正文图片** 插入图片，点图片块编辑图片与说明。
- 用正文下方的 **图片上移 / 图片下移** 调整图片与相邻正文块的顺序。图片块菜单 **Remove** 只删除正文里的图片块，不删除媒体文件。
- Hero 仍独立。正文图片 alt、来源等可以在草稿阶段留空；发布校验要求图片及非空英文 alt，填写许可证时要求来源链接。
- 正文外链仅允许 HTTPS；站内链接允许根路径与锚点。图片使用响应式尺寸、懒加载和 object-fit；字体、字号、颜色由品牌 CSS 决定。

## 实现与迁移

当前版本为 TinaCMS 3.12.1、CLI 2.6.1。使用官方 rich-text、MDX templates 和自定义字段接口，未改后台 bundle 或 node_modules 源码。

参考：[Rich-text](https://tina.io/docs/reference/types/rich-text)、[Rendering Markdown](https://tina.io/docs/reference/types/rendering-markdown)。JSON 集合显式设置 `parser: { type: 'mdx' }`，文件的 `body` 保存为 MDX 字符串；Tina 编辑时提供 AST。前台使用官方解析器及允许列表 React 渲染器，不执行 MDX 或原始 HTML。

仅迁移以下六篇，均保持 draft：

1. how-to-pay-in-yunnan
2. china-visa-entry-guide-yunnan
3. essential-apps-for-traveling-in-yunnan
4. how-to-get-around-yunnan
5. best-time-to-visit-yunnan
6. internet-sim-cards-yunnan

将介绍、分节标题、正文和图片按旧版展示顺序合并为 `body`。六篇的旧 `content` 已从数据中移除；Tina 后续保存可能写入空 `content: {}`，前台只渲染一次新正文。旧 schema 字段隐藏，仅服务兼容读取。未迁移用户攻略仍显示原正文，后台明确提示尚未迁移并保护其原文，不自动转换或覆盖。

迁移脚本采用固定六篇允许列表，先验证所有输入再写入，重复运行会跳过已迁移文档：

```powershell
node --experimental-strip-types scripts/migrate-travel-guide-rich-text.mjs
```

首次迁移需显式加 `--write`。本次迁移已完成，不需要重新执行。逐篇与 Git 中的旧数据核对：新正文等于迁移函数输出，其余标题、分类、摘要、Hero、SEO、状态等元数据完全一致；保留所有旧段落、列表、FAQ、引用链接，以及支付攻略的两张正文图片和独立首图。

`yunnanyoutube.json`、`yunnan-travel-guide.json` 和原有未跟踪用户文件未修改。保留清单的 132 项 SHA-256 均一致；所有非 Travel Guide 集合的锁文件 schema 与原版本一致。

## 验证与限制

- 浏览器新建临时 draft，输入两段正文并在中间插入已有媒体库图片，之后加入 H2、列表和 HTTPS 链接；保存、刷新后顺序不变。
- alt 留空时草稿保存成功。图片以 medium / right / 3:4 / top 和 caption 保存。
- 点击图片下移，保存、刷新后顺序为段落、段落、图片、H2、列表、链接，图片属性保持。
- 通过图片菜单 Remove 删除，再保存、刷新，正文文字、H2、列表、链接保留。
- 前台检查 1440px 与 390px：没有横向溢出；图片使用 3:4、object-fit: cover、顶部焦点及 lazy loading；外链带 target=_blank 和 noopener noreferrer。已修正被全站 reset 隐藏的列表符号。
- 六篇攻略逐篇在浏览器打开，标题与 FAQ 均出现；支付攻略的三张图片均在页面中。
- TypeScript、ESLint、32 项 Travel Guide 专项测试通过；未跑全站 production build 或 Journey / Walk 回归。
- 临时 draft `phase-24d-temporary-rich-text.json` 已删除，测试使用的原有媒体未删除。未新增、下载、生成或自动匹配图片。

限制：Tina 原生自定义模板在正文里显示图片块标签，真实图片排版在前台预览查看。当前没有原生拖动手柄；本次剪切粘贴图片块验证出现编辑器错误，因此提供已验证的上移 / 下移按钮，不承诺剪切粘贴或拖拽可用。中文真实 IME、所有浏览器和所有图片预设组合未在本次逐项验收，待用户实际试用。

## 修改文件

- `tina/config.ts`、`tina/tina-lock.json`：Travel Guide 正文 schema。
- `tina/fields/TravelGuideBodyField.tsx`：原生编辑器及图片排序按钮。
- `tina/travelGuideSave.ts`：正文安全校验、草稿/发布校验及旧正文保护。
- `shared/travelGuideRichTextSchema.ts`、`shared/travelGuideRichText.ts`：图片模板、AST、安全 URL、旧数据适配。
- `app/lib/travelGuideRichText.ts`、`app/lib/travelGuideContent.ts`、`app/types/travelGuide.ts`：解析与正文读取。
- `app/components/travel-guides/TravelGuideBody.tsx`、`travel-guide-body.module.css`、`TravelGuideDetailPage.tsx`：按顺序渲染和品牌样式。
- `scripts/migrate-travel-guide-rich-text.mjs`：六篇允许列表迁移工具。
- `tests/travel-guide-content.test.mjs`、`tests/travel-guide-rich-text.test.mjs`：定向测试。
- 上述六篇 `content/travel-guides/*.json`。
- `package.json`、`pnpm-lock.yaml`：显式依赖已安装的官方 `@tinacms/mdx@2.2.1` 和测试入口。
- 本文档。

全部为本地未提交改动；未推送、部署或发布文章。
