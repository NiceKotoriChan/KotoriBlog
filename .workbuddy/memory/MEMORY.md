# 项目约定（KotoriBlog）

- **零构建**：不要 Node、不要生成器、不要 package.json。用户明确说过「静态就别要 node」。
- 文章就是 `posts/*.md`，**不加 frontmatter**；首页只显示文件名（读 `posts/index.txt`，一行一个）。
- 新增文章 = 新建 md + 在 `posts/index.txt` 里加一行（顺序即首页顺序）。
- 正文渲染在浏览器端完成（`assets/markdown.js`），文章页用 `post.html?p=文件名.md`。
- 视觉：终端/代码风，等宽、块状边框，深色为默认，右上角可切浅色。
- 本地预览必须起静态服务（`python3 -m http.server`），`file://` 读不了 md。
- 部署：Cloudflare Pages，Build command 留空，输出目录 `/`。
- 代码风格沿用用户偏好：不写注释。
