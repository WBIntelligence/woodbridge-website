# 木乔智科官网融合设计版 v11｜源码整理版

本版本基于 v10 的视觉结果整理源码，目标是保持页面当前样式统一，同时把之前追加在 CSS 末尾的临时补丁合并回源代码结构中。

## 文件结构

- `index.html`：首页
- `platform.html`：平台能力
- `application.html`：应用场景
- `research.html`：技术研究
- `team.html`：关于我们
- `contact.html`：联系合作 / 加入我们占位页
- `styles.css`：全站唯一样式文件
- `app.js`：导航、入场动画、任务标签切换逻辑

## 本次整理内容

1. 重写并整理 `styles.css`，按 Header、Button、Section、Hero、Card、Page Modules、CTA、Footer、Responsive 的顺序组织。
2. 删除历史版本中追加的 v3 / v5 / v6 / v7 / v8 / v10 补丁式代码，所有规则已合并到对应源码位置。
3. 全站字体统一为：
   `"Noto Serif SC", "Source Han Serif SC", "Songti SC", "SimSun", serif`。
4. 保留所有页面的整屏深绿色 CTA 横幅，并统一按钮样式。
5. 保留封面页自身排版，其余 section 的标签、标题、副标题统一居中。
6. 保留当前文案内容，不重新改写页面文案。
7. 将 `video-占位` 类名整理为 `video-placeholder`，避免类名中混用中文造成后续维护不便。

## 使用方式

直接打开 `index.html` 即可预览。上传到 GitHub Pages 或服务器时，保持这些文件在同一目录下即可。

## 2026-04 交互更新

- 全站卡片统一加入 Hover Lens 鼠标聚焦效果。
- 交互样式已合并进 `styles.css` 的 Cards 源码区域，不再以临时补丁形式追加。
- 交互脚本已整理进 `app.js` 的 `initHoverLens()`，与导航、滚动显现、标签切换逻辑分开维护。
