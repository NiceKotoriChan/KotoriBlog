没有构建步骤，所以部署比一般静态博客更省事：把这一整个文件夹传上去就行。

## 方式一：连 Git（推荐）

推到 GitHub，在 Cloudflare Pages 里连仓库，构建配置这样填：

| 配置项 | 值 |
| --- | --- |
| Framework preset | None |
| Build command | 留空 |
| Build output directory | `/`（仓库根目录） |

没有 build command，Cloudflare 会直接把仓库当静态文件发。以后每次 push 自动更新。

## 方式二：直接上传

不想连仓库的话：

```bash
npx wrangler pages deploy . --project-name=kotoriblog
```

或者把文件夹拖进 Cloudflare 控制台的 Direct Upload 上传框。

## 本地看效果

不能双击 `index.html`——浏览器会拦掉 `fetch` 读取本地 md，页面会显示读取失败。

起一个本地静态服务就好，Python 自带：

```bash
python3 -m http.server 8000
```

然后打开 http://127.0.0.1:8000 。

## 绑域名

Pages 项目的 **Custom domains** 里加一条，域名本来就托管在 Cloudflare 的话会自动签发证书。

## 几个小地方

- `404.html` 放在根目录，Pages 会自动拿它当未命中页
- 想加响应头，在根目录放 `_headers`
- 文章多起来之后，首页每次都会把 `index.txt` 和所有 md 都读一遍；几十篇没问题，上千篇就该考虑回到构建方案了
