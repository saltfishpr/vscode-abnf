# vscode-abnf

> Visual Studio Code 的 ABNF（扩充巴科斯范式）语言支持

为 [ABNF](https://datatracker.ietf.org/doc/html/rfc5234) 语法提供语言支持，兼容 [RFC 5234](https://datatracker.ietf.org/doc/html/rfc5234) 和 [RFC 7405](https://datatracker.ietf.org/doc/html/rfc7405)。

<p align="center">
  <img src="image.png" alt="ABNF Language Support" />
</p>

## 功能特性

- **语法高亮** — 完整支持 ABNF 语法，包括规则定义、字符串字面量、数值和注释
- **跳转定义** — 使用 `F12` 快速跳转到规则定义
- **查找引用** — 使用 `Shift+F12` 查找规则的所有引用
- **悬停提示** — 鼠标悬停在规则名上查看其定义
- **自动补全** — 智能提示规则名称
- **文档大纲** — 大纲视图中快速浏览和导航当前文件的规则

## 语言支持

本扩展支持所有标准 ABNF 语法结构：

| 语法结构     | 示例                        |
| ------------ | --------------------------- |
| 规则定义     | `rule-name = / alternation` |
| 字符串字面量 | `"string"`                  |
| 区分大小写   | `%s"Case-Sensitive"`        |
| 不区分大小写 | `%i"case-insensitive"`      |
| 二进制       | `%b01010010`                |
| 十进制       | `%d114`                     |
| 十六进制     | `%x72.72`                   |
| Prose 值     | `<some prose>`              |
| 重复         | `1*3`, `*`, `3`             |
| 分组         | `(elem1 elem2)`             |
| 可选         | `[optional]`                |
| 选择         | `elem1 / elem2`             |
| 串联         | `elem1 elem2`               |

### 核心规则

RFC 5234 核心规则使用特殊样式高亮：

`ALPHA`, `BIT`, `CHAR`, `CR`, `CRLF`, `CTL`, `DIGIT`, `DQUOTE`, `HEXDIG`, `HTAB`, `LF`, `LWSP`, `OCTET`, `SP`, `VCHAR`, `WSP`

## 扩展设置

本扩展无自定义设置项。

## 已知问题

暂无。如发现问题请在 GitHub issue 追踪器中报告。

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run compile

# 监听模式
npm run watch

# 代码检查
npm run lint

# 运行测试
npm run test

# 打包扩展
npm run package
```

## 许可证

MIT

## 相关资源

- [RFC 5234 - Augmented BNF for Syntax Specifications: ABNF](https://datatracker.ietf.org/doc/html/rfc5234)
- [RFC 7405 - Case-Sensitive String Support in ABNF](https://datatracker.ietf.org/doc/html/rfc7405)
- [tree-sitter-abnf](https://github.com/saltfishpr/tree-sitter-abnf) — ABNF 的 Tree-sitter 语法
