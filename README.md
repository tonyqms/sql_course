# SQL 30 天互动教程

本地运行的 30 天双语 SQL 学习网页：English / 中文语言选择、结构化课文、概念级折叠、每日目录、每日 3 套练习、阶段 Quiz、期中/期末、错题本、进度追踪。

## 教材参考（请自行使用本地 PDF）

- *Practical SQL* — Anthony DeBarros
- *SQL Pocket Guide* — Alice Zhao
- *SQL Cookbook* — Anthony Molinaro
- *Head First SQL* — Lynn Beighley

课程内容为本工具**原创学习材料与练习题**，不复制教材原文。教材仅作为参考阅读方向；网页中的概念、例子和自检问题围绕本仓库内置练习数据库编写。

## 如何打开

**不要**直接双击 `index.html`（浏览器会拦截 ES Module）。请用本地 HTTP 服务器：

### 方式 1：Python（推荐）

```powershell
cd c:\Users\MingshengQi\Downloads\sql-learning-mvp
python -m http.server 8080
```

浏览器访问：<http://localhost:8080>

### 方式 2：Node.js

```powershell
npx --yes serve c:\Users\MingshengQi\Downloads\sql-learning-mvp -p 8080
```

### 方式 3：VS Code / Cursor

安装 **Live Server** 扩展，右键 `index.html` → Open with Live Server。

## 功能清单

| 功能 | 状态 |
| ---- | ---- |
| English / 中文启动语言选择 | ✅ |
| Day 1–30 双语结构化课文 | ✅ |
| 每日目录（概念锚点导航） | ✅ |
| 概念级折叠/展开 | ✅ |
| 每日 3 套题（3 选择 + 3 SQL） | ✅ |
| 自动打分（SQL 按结果集比对） | ✅ |
| Day 5/10/15/20/25 Quiz | ✅ |
| Day 15 期中、Day 30 期末 | ✅ |
| 错题本 + 标记已掌握 | ✅ |
| 进度 localStorage 持久化 | ✅ |
| 今日最低任务（1 套 ≥60%） | ✅ |
| 学习报告导出 | ✅ |
| 第 2 轮学习（打乱无依赖章节） | ✅ |
| SQL 试运行（不计分） | ✅ |

## 项目结构

```text
sql-learning-mvp/
├── index.html          # 入口
├── css/styles.css
├── js/
│   ├── app.js          # 主应用
│   ├── schema.js       # 练习库表结构与数据
│   ├── grader.js       # 打分逻辑
│   ├── progress.js     # 进度与错题本
│   └── dag.js          # 第 2 轮依赖与打乱
└── data/
    ├── lessons.js      # 30 天课文
    └── questions.js    # 题库 / Quiz / 考试
```

## 练习数据库

六张表：`departments`, `employees`, `customers`, `products`, `orders`, `order_items`  
使用 [sql.js](https://sql.js.org/) 在浏览器内运行 SQLite。

## 后续改进方向

- [ ] 间隔复习算法（错题自动回流）
- [ ] 导出 PDF 学习报告
- [ ] 从用户上传 PDF 目录生成课纲的工作流
- [ ] 难度自适应
- [ ] PWA 离线支持

## 版权说明

用户自备教材 PDF。本工具仅提供原创练习题与知识摘要，不包含教材全文。
