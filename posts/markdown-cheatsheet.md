这篇既当说明，也当渲染器的验收清单。往下滚一遍，就知道哪些语法能用。

## 行内样式

**加粗**、*斜体*、~~删除线~~、`行内代码`，还有 [普通链接](about.md) 和自动识别的裸链接 https://example.com 。

中文里混着 `code` 和 **strong** 的时候，标点也不会串。

## 列表

无序列表：

- 第一项
- 第二项，稍微长一点，看看换行之后缩进对不对
- 第三项
  - 嵌套一层
  - 再嵌套一层
    - 第三层也可以
- 回到第一层

有序列表：

1. 先把文件写好
2. 刷新页面
3. 完事

任务列表：

- [x] 写完解析器
- [x] 接上样式
- [ ] 加个搜索
- [ ] 图片懒加载的占位图

## 引用和分隔线

> 引用里的文字会稍微暗一点，左边有一道竖线。
>
> 空一行也可以继续引用。

---

分隔线上面和下面各留一点空。

## 代码

带语言标签的代码块会做一点轻量的高亮，右上角有复制按钮：

```js
const files = ['hello.md', 'about.md'];

export function read(file) {
  return fetch('posts/' + file).then((response) => response.text());
}
```

```bash
python3 -m http.server 8000
curl -s http://127.0.0.1:8000/posts/index.txt
```

```python
def files(path):
    return sorted(p.name for p in path.iterdir() if p.suffix == ".md")
```

没有语言标签的话，就当纯文本处理：

```
$ echo "hello"
hello
```

## 表格

| 文件 | 作用 |
| --- | :--- |
| `index.html` | 首页，列文件名 |
| `post.html` | 文章页，渲染 md |
| `posts/index.txt` | 首页显示哪些文件 |

## 标题层级

`##` 是二级标题，带一条下划线；`###` 更小一点；`####` 只用来分隔小节。

#### 这是四级标题

四级标题字号小一点，颜色也淡一点。

## 还有这些

- 图片支持 `![alt](src)`，会加 `loading="lazy"`
- 外部链接自动带 `target="_blank"` 和 `rel="noopener"`
- 单个换行会被并成同一段，分段请空一行
- 不支持数学公式和脚注（用不上）
