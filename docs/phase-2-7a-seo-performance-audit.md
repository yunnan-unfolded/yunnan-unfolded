# Phase 2.7A SEO and performance audit

Audit completed locally on 4 October 2026. Baseline: `9163205b9230026452412bb87285f21809cc057f`. This report was prepared before the authorised local commit. Nothing has been published.

## Search readiness

The live root robots.txt and sitemap.xml return 200. The Sitemap uses 14 unique absolute HTTPS URLs: Home, Journeys, Walk Yunnan, Travel Guides, About, Plan My Trip, one published Journey, one published Walk and six published Travel Guides. All return 200. Canonicals are unique and self-referencing; titles and descriptions are present and unique; each page has one H1. Pages permit indexing through the normal index/follow default and do not emit noindex. No Sitemap drafts, local URLs, duplicate URLs, broken internal links or invalid anchors were found.

53 distinct image URLs were checked using real Chrome: same-origin HEAD responses succeeded and external images loaded. Nondecorative image descriptions are English. Empty alts on background/decorative photography and the labelled logo link were not replaced with speculative descriptions.

JSON-LD parses successfully. Organization, AboutPage, CollectionPage, Article, TouristTrip and BreadcrumbList data do not show conflicting identities or invented ratings/prices. Publicly loaded HTML, scripts and styles were scanned (374 resources); no draft markers, credential-shaped tokens, personal test data, Windows user paths or LAN URLs were found.

Search readiness does not establish actual Google indexing. Search Console could not be accessed: the current-browser tool failed to initialize. Ownership, Sitemap submission/read status, indexed-page counts, exclusion reasons, Core Web Vitals, Manual Actions and Security Issues remain unverified. No settings were changed.

## Field data

No field data was obtained. The official PageSpeed Insights attempt returned 429 from its analysis backend. Whether the site has enough CrUX samples is unknown; this is not evidence that samples are insufficient. No p75 LCP, INP or CLS pass/fail conclusion is possible.

Official good thresholds are LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile: https://web.dev/articles/vitals

## Lab data: live site

One cold-cache sample per page template in Chrome, mobile 390px/DPR2, 150ms latency, 1.6Mbps download, CPU 4x slowdown. PerformanceObserver/CDP measurements, not Lighthouse scores and not real-user Core Web Vitals.

| Template | LCP | CLS | Blocking time |
| --- | ---: | ---: | ---: |
| Home | 7.86s | 0.0045 | 255ms |
| Journey detail | 4.66s | 0 | 260ms |
| Walk detail | 19.85s | 0.0014 | 255ms |
| Travel Guide detail | 2.52s | 0.0014 | 267ms |
| About | 2.04s | 0 | 259ms |
| Plan My Trip | 3.68s | 0.0015 | 323ms |

Unthrottled desktop samples: Home LCP 1.19s / CLS 0.0083; Plan My Trip LCP 1.11s / CLS 0.0177. Recorded click-event durations were 48–80ms on mobile. These few interactions cannot establish INP.

The first-screen images were LCP elements for Home, Journey, Walk, Guide and Plan My Trip; About's introductory text was LCP. Live JS encoded transfer was approximately 176–183KB per template. JS responses used gzip and max-age=600. Third-party resource hosts included fonts.googleapis.com, images.pexels.com and assets.tina.io. No tracking was added. Non-hero images generally use lazy loading, and observed layout shifts were small. Limited interaction coverage does not establish that otherwise unused code can be removed safely.

## Prioritized findings

- **P0:** No confirmed public-site blocker in this audit. Google indexing/security status is unknown without Search Console.
- **P1:** Home downloads both CSS-hidden desktop and mobile priority images (718KB combined). The Walk LCP image is a 3.45MB PNG. The mobile Plan image is a 330KB desktop JPEG.
- **P2:** Walk directory and Plan My Trip lack OG images; Walk Twitter metadata inherits Home copy. Playfair Display is requested again through an external CSS import despite existing Next self-hosting. CMS-hosted Journey hero delivery, static responsive resources for other large images, cache policy and 255–323ms lab blocking time warrant future focused investigation; no architectural rewrite was attempted.

## Local changes

- Home first slide uses one picture/image with viewport-selected CMS sources. Mobile no longer requests the desktop JPEG. All three slides are read from the new Tina Home configuration rather than constants in the renderer. There is no fixed derivative mapping for Home; same-name overwrites cannot remain bound to an old derivative.
- Added two derivatives of existing confirmed images. Originals and existing Journey/Walk/Guide content files are unchanged. Home uses its configured original mobile image (365KB) or desktop image (353KB), instead of downloading both (718KB). Mobile Plan image is 79KB (vs 330KB). Walk image preserves its original 1086×1448 dimensions and crop, is 599KB (vs 3.45MB PNG), and only the exact known source is mapped; unrelated CMS sources pass through unchanged. The three initial fixed Home derivatives were removed before commit.
- Removed duplicate external font import and CSS variable override; headings still use Playfair Display from existing next/font self-hosting.
- Added page-specific OG/Twitter images and corrected inherited Walk Twitter copy using existing page text.
- Updated two stale tests referencing the generic placeholder route deleted on the baseline; retained draft-isolation checks. Added actual browser responsive-request and rendered-metadata regressions.

Changed files (19):

- app/components/HeroSlideshow.tsx
- app/components/walks/WalkDetailPage.tsx
- app/globals.css
- app/plan-my-trip/page.tsx
- app/walk-yunnan/page.tsx
- app/lib/optimizedImages.ts
- tests/seo-performance.test.mjs
- tests/walk-content.test.mjs
- tests/travel-guide-content.test.mjs
- public/images/optimized/laoyao-mountain-960.webp
- public/images/optimized/luoguqing-hero-1086.webp

- app/lib/homeContent.ts
- content/home/home.json
- tina/config.ts
- tina/homeCollection.ts
- tina/fields/HomeImageField.tsx
- tina/tina-lock.json
- tests/home-hero-cms.browser.test.mjs
- docs/phase-2-7a-seo-performance-audit.md

## Verification and limits

TypeScript, ESLint, relevant Journey/Walk/Guide/enquiry tests, browser regressions, the initial production build and one rebuild after the Home CMS correction, custom-domain static export verification and git diff --check pass after addressing the stale baseline tests. next-env.d.ts has no final diff. tina-lock.json now includes Home; all three existing collection schemas are identical to the baseline.

18 rendered checks cover six templates at 1440px, 390px and 430px. Full-page screenshots were inspected: one H1, no horizontal overflow, broken images, obvious stretching or obscured text. English form Start/Continue/Back, retained values, required/invalid email messages, every FAQ, mobile menu and source context from Journey/Walk/Guide were clicked successfully. POST requests were intercepted; no emails were sent. Browser emulation is not a new physical-phone acceptance test. Current-session automatic translation was not tested in this phase.

Initial prototype local retest (the Home fixed-derivative implementation was subsequently removed, so its LCP is not a measurement of the final Home): Home LCP 6.53s, Walk 7.60s, Plan My Trip 2.58s; CLS 0 in these samples. These use an uncompressed local server rather than the live gzip/CDN server, and the Home sample overlapped other browser checks; do not treat them as controlled before/after estimates of production improvement or as passing field metrics. Remaining LCP work is not hidden by a passing build.

The Windows export stores some Next RSC segment files at nested paths, while the browser requests dotted paths. This caused local preview prefetch 404s; the live site counterpart had no errors. Only the ignored temporary preview server maps those paths to actual export files. Application routing and deployment workflows were not changed. Interaction tests passed after this preview correction.

All 157 text export files were scanned. Public pages and loaded bundles have no detected drafts, credential-shaped tokens, test data or local addresses/paths. The locally generated Tina admin/index.html contains its local CMS GraphQL address. Thus this local CMS preview export is not directly suitable for deployment; it is not being represented as a fully clean cloud-admin release artifact. No secrets or external configuration were changed.

Preview is running from this worktree on 0.0.0.0:3002. Loopback and LAN requests return 200. The 130 original untracked user files remain untouched. Branch: codex/phase-2-7a-seo-performance-audit. The authorised local commit includes only the 19 intended files. No push, deployment or PR is authorised by this follow-up. Original Plan My Trip preview on 3001 remains running.

## Home image CMS verification, 4 October 2026

The baseline did not have a Home Tina collection: its three slideshow sources were hard-coded in HeroSlideshow. Therefore there was no pre-existing Home field connection to preserve. This was disclosed before adding a narrowly scoped Home image configuration. Page copy, layout and the three existing Journey/Walk/Guide collections were not changed.

Tina now edits content/home/home.json. Each of the three fixed slideshow positions has desktopSrc, optional mobileSrc, English alt and place fields. The renderer reads that JSON and passes its actual field values to the image/picture sources. With no mobileSrc, both viewports use the desktopSrc responsively. With independent fields, each viewport reads its respective field. No code edit is required when choosing another image. Existing image-picker support is retained, with a bound path/HTTPS-address input for already existing images outside the shared media-library root.

Real Chrome UI test against the local Tina editor, not direct JSON writes:

1. Selected an existing Laoyao image through the media picker, clicked Insert and Save. Tina GraphQL succeeded; the 1440px Home preview loaded the saved desktop source, while mobile retained its configured image.
2. Changed the mobile field to an existing Erhai image and clicked Save. Both 390px and 430px loaded that saved mobile source; desktop retained the separate saved desktop source.
3. Cleared the mobile field and saved. Both mobile widths loaded the desktop source. Reloading the editor retained the saved fields.
4. Restored both original source values through the editor and saved. All three widths loaded their original configured sources. The entire parsed Home document equals the pre-test document, including untouched slides and descriptions. Four save mutations returned HTTP 200 without GraphQL errors.

No image was uploaded, downloaded into the repository or generated for this test. Existing approved image files were reused. Test selections were removed from Home configuration. Screenshots and detailed evidence remain ignored under artifacts/home-cms. The reproducible UI regression test is tests/home-hero-cms.browser.test.mjs; it performs temporary local saves and restores in finally, and blocks POSTs outside the local Tina endpoint.

The CMS-backed development preview runs at the active local CMS preview and its editor at /admin/index.html#/collections/edit/home/home. Saving updates this development preview. The production static preview on port 3002 reflects the final rebuilt configuration; future live-site changes still follow the site's existing content-save/build/publish workflow. No external service or deployment was modified.

## 首页后台易用性收口（2026-10-04，未提交）

本轮保留已有本地提交 `d922fd12784eafaabefe167a149655edbf86b036`，新增修改未提交、未暂存、未推送或部署。

首页专用照片由「首页图片」集合按页面从上到下维护。新增 Another side、首页咨询背景、Walk 区域横幅和 Meet Chloe 四处图片配置，每处只有图片、英文说明及可选裁切焦点。原有轮播地点文案保留在数据中并隐藏编辑控件，不增加复杂图片字段。Meet Chloe 默认引用 About 已用的 `/images/about/chloe-alpine-lake.webp`（1600×2000）；没有复制、下载或生成图片文件，也没有修改 About。

Journey 三张卡片的现状已在实施前报告：只有 Yunnan, Slowly 来自 Journey collection；The Old Roads of Yunnan 与 South into the Green 来自 `app/data/siteContent.ts` 的静态示例数组，链接都为 `/journeys/`。随后按用户授权，将两个示例图片接入首页集合；原名称、文案、顺序、链接保持不变，不创建 Journey 详情。静态数组仅保留非图片内容与对应首页图片键，图片和英文说明只在首页 JSON 维护一次。

三张 Travel Guide 卡片之前覆盖了 collection 封面，使用固定的首页缩略图映射。本轮仅修正首页读取方式，改为 `guide.hero.src` 并继续采用所属攻略的焦点与 alt。Journey 和 Walk 的真实卡片继续读取所属内容的封面。首页后台提供只读中文说明和对应集合链接，不重复保存卡片封面。图片采用直接源地址以支持 CMS 新选择的 HTTPS 图片，不限制于开发图片优化器的远程白名单；既有布局、类名、尺寸约束和页面文案保持不变。

### 每张首页图片的维护入口

「首页图片」入口：`/admin/index.html#/collections/edit/home/home`。

| 首页图片 | 最终真实来源 | 用户更换位置 |
| --- | --- | --- |
| 页首 Logo | 共享 Header 的 `public/brand/logo-horizontal-light.svg` | 全站品牌资源；不在首页增加重复字段 |
| 首屏桌面图片 | `content/home/home.json` → `first.desktopSrc` | 首页图片 → 1. 首屏图片 → 桌面图片 |
| 首屏手机图片 | `first.mobileSrc`；留空时使用桌面图片 | 首页图片 → 1. 首屏图片 → 手机图片 |
| 第二张轮播图片 | `second.desktopSrc` / 可选 `mobileSrc` | 首页图片 → 2. 轮播图片 |
| 第三张轮播图片 | `third.desktopSrc` / 可选 `mobileSrc` | 首页图片 → 3. 轮播图片 |
| Another side of Yunnan | `introduction.src`；保留用户当前保存的图片 | 首页图片 → 4. Another side of Yunnan 区域图片 |
| 首页咨询背景 | `inquiry.src`；保留用户当前保存的图片 | 首页图片 → 5. 首页咨询区域背景图片 |
| Yunnan, Slowly 卡片 | `content/journeys/yunnan-slowly.json` → `hero.src` | 精品行程 → 对应行程 → 1. 基本信息 → Hero 图片 |
| The Old Roads of Yunnan 卡片 | `content/home/home.json` → `oldRoads.src`；默认原 Pexels 6513729 | 首页图片 → 7. The Old Roads of Yunnan 卡片图片 |
| South into the Green 卡片 | `content/home/home.json` → `southGreen.src`；默认原 Pexels 2832039 | 首页图片 → 8. South into the Green 卡片图片 |
| Walk Yunnan 区域背景 | `walkBanner.src`；保留用户当前保存的图片 | 首页图片 → 9. Walk Yunnan 区域背景图片 |
| Luoguqing Rhododendron Walk 卡片 | `content/walks/luoguqing-rhododendron-walk.json` → `hero.src` | 徒步路线 → 对应路线 → 2. 首图 |
| How to Pay in Yunnan 卡片 | `content/travel-guides/how-to-pay-in-yunnan.json` → `hero.src` | 旅行攻略 → 对应攻略 → 3. 封面图 |
| Best Time to Visit Yunnan 卡片 | `content/travel-guides/best-time-to-visit-yunnan.json` → `hero.src` | 旅行攻略 → 对应攻略 → 3. 封面图 |
| How to Get Around Yunnan 卡片 | `content/travel-guides/how-to-get-around-yunnan.json` → `hero.src` | 旅行攻略 → 对应攻略 → 3. 封面图 |
| Meet Chloe 人物图片 | `chloe.src`，默认复用 About 的真实 Chloe WebP 原文件 | 首页图片 → 12. Meet Chloe 人物图片 |
| 页尾 Logo | 共享 Footer 的 `public/brand/logo-wordmark-light.svg` | 全站品牌资源；不在首页增加重复字段 |

页尾社交图标是共享 Footer 的 SVG 图形；其余装饰为 CSS，不存在额外首页照片或后台图片字段。

### 实际后台验证

通过真实 Chrome 操作本地 Tina 表单，不以直接改 JSON 代替后台保存：

- Another side 临时选择现有 Laoyao 图片，并设置靠上焦点；保存后，1440/390/430px 都加载对应图片并显示 `50% 0%` 焦点。
- Meet Chloe 临时选择 About 已有的另一张真实 Chloe 图片 `chloe-rhododendrons.webp`；保存后，三个宽度均加载对应图片。
- 分别通过后台恢复正式图片与原始焦点；共四次 Tina mutation，全部 HTTP 200，无 GraphQL 错误。
- 恢复后的完整首页 JSON 与测试前正式配置一致。没有遗留测试选择，没有增加图片文件。
- 在两次临时换图及最终恢复三个阶段，共九次视口检查，均无横向溢出或运行时错误。截图已人工检查，正式 Chloe 面部完整、图片无拉伸，裁切保持现有区域规则。所有三张攻略卡片与真实 Journey/Walk 卡片逐项核对所属 JSON 封面；两个静态 Journey 示例标题与链接保留。
- 首页后台中文帮助与集合入口已实际显示，1440px 编辑器无横向溢出。
- TypeScript、修改文件 ESLint、Travel Guide 专项测试（25 项）、新的真实后台图片回归测试及 `git diff --check` 通过。本轮不重复完整生产构建或性能测量。
- 不发送询盘邮件；浏览器拦截本地 Tina GraphQL 之外的 POST。

最新 CMS 首页预览是 `the active local CMS preview`。3002 为此前静态快照，本轮没有重建，验收此次修改请使用 3004。原 Journey/Walk/Travel Guide JSON、About 页面、全部图片资源均无差异。静态示例数组只移除图片值重复维护，文案未变。

### 两张示例卡片后台接入验证（追加，未提交）

- 首页字段按顺序连续编号 1–12；6、10、11 为所属集合封面的只读维护说明，7、8 为新增可编辑卡片图片。新增卡片每张仅图片和英文图片说明两个字段。Logo 继续使用固定共享品牌资源。
- Chrome 实际通过 Tina 保存两张现有本地测试图，1440/390/430px 均加载所保存的图片；再通过 Tina 恢复原图。四次保存全部 HTTP 200，恢复后整个首页 JSON 与测试前一致，用户之前保存的其他图片均保留。
- 六次视口检查无横向溢出、无页面运行时错误；标题、文案、卡片顺序和链接逐项与测试前一致。截图复核无图片拉伸，裁切采用原有 cover 样式。仅浏览器视口模拟，非实体手机验证。
- TypeScript、修改文件 ESLint、真实后台卡片保存回归测试、git diff --check 通过。没有重复生产构建，没有提交、推送或部署。
- 首页除固定 Logo 和内容集合自动读取的封面外，所有专用照片均可在「首页图片」中更换。

### 人工验收与提交收口（2026-10-08）

用户确认首页图片后台人工验收通过。提交仅包括本轮首页图片读取、Tina 配置、对应测试及审计记录。测试临时图片已恢复，用户验收后的正式配置保持不变。浏览器回归测试通过 HOME_CMS_TEST_BASE_URL 和 HOME_CMS_TEST_API_URL 显式指定测试服务；未提供时跳过，不将本机地址写入仓库。截图、临时脚本、图片文件、next-env.d.ts 和原工作区用户文件不纳入本轮提交。
