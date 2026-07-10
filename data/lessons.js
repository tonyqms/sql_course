/**
 * 30-day SQL learning curriculum.
 *
 * The material here is original study guidance built around the local practice
 * schema: departments, employees, customers, products, orders, order_items.
 */

const TOPIC_DAYS = [
  {
    title: { en: 'SQL Foundations: Databases and SELECT', zh: 'SQL 入门：数据库与 SELECT' },
    minutes: 35,
    objectives: {
      en: ['Recognize tables, rows, columns, and result sets', 'Run SELECT * safely to inspect a table', 'Map the six practice tables to business entities'],
      zh: ['识别表、行、列和结果集', '安全地运行 SELECT * 查看表', '把六张练习表对应到业务对象'],
    },
    concepts: [
      c('What SQL Asks For', 'SQL 在问什么', 'Think of SQL as a precise request for a table-shaped answer.', 'SQL 是向数据库索要“表格形答案”的精确语言。', 'A database stores related facts in tables. A query does not change the stored data unless it is a data-changing statement; a SELECT builds a temporary result set from those facts. In this course, employees, departments, customers, products, orders, and order_items are small enough to inspect directly, so use SELECT as a microscope before you write more complex logic.', '数据库把相关事实放在表中。查询通常不会改变存储的数据；SELECT 只是从事实中临时组装一个结果集。本课程的 employees、departments、customers、products、orders、order_items 都很小，适合先用 SELECT 当显微镜观察，再写复杂逻辑。', 'SELECT * FROM employees;', 'Before solving a problem, name the table that contains the grain you need.', '解题前先说清楚：答案的一行应该来自哪张表、代表什么粒度。'),
      c('Tables Have Grain', '表有粒度', 'The grain tells you what one row means.', '粒度说明“一行”到底代表什么。', 'employees has one row per employee. orders has one row per order. order_items has one row per product line inside an order. Many SQL mistakes happen because the query mixes grains: counting order_items answers a different question from counting orders.', 'employees 一行是一名员工；orders 一行是一张订单；order_items 一行是订单里的一条商品明细。很多 SQL 错误来自混淆粒度：数 order_items 和数 orders 回答的是不同问题。', 'SELECT * FROM orders;\nSELECT * FROM order_items;', 'Say the grain aloud before using COUNT or JOIN.', '使用 COUNT 或 JOIN 前，先把结果粒度说出来。'),
      c('SELECT Anatomy', 'SELECT 语句结构', 'The simplest query has SELECT columns FROM table.', '最简单查询是 SELECT 列 FROM 表。', 'SELECT chooses the output columns. FROM chooses the source table. A semicolon is not always required by an engine, but it is a useful habit because it marks the end of your thought. Start broad with SELECT * while exploring, then switch to named columns when answering a real question.', 'SELECT 决定输出列，FROM 决定来源表。分号不一定强制，但它能标记语句结束。探索时可以先 SELECT *，真正答题时应改成明确列名。', 'SELECT first_name, last_name, salary\nFROM employees;', 'Can you explain what each clause contributes?', '你能解释每个子句分别贡献了什么吗？'),
    ],
    pitfalls: { en: ['Do not assume table order has meaning without ORDER BY.', 'SELECT * is useful for discovery, not for stable reports.'], zh: ['没有 ORDER BY 时不要假设表的默认顺序有意义。', 'SELECT * 适合探索，不适合稳定报表。'] },
    readingRefs: ['Practical SQL Ch.1-2', 'Head First SQL Ch.1', 'Pocket Guide SELECT'],
  },
  {
    title: { en: 'Choosing Columns, Aliases, and DISTINCT', zh: '选择列、别名与 DISTINCT 去重' },
    minutes: 32,
    objectives: {
      en: ['Return only columns needed by the question', 'Use aliases to make outputs readable', 'Use DISTINCT to inspect unique value combinations'],
      zh: ['只返回题目需要的列', '用别名让输出更可读', '用 DISTINCT 查看唯一值组合'],
    },
    concepts: [
      c('Projection', '投影：选择列', 'Projection means choosing columns from rows.', '投影就是从行中选择要显示的列。', 'A good query output is narrow and intentional. Returning only first_name, last_name, and salary makes the result easier to scan than returning every employee field. This habit also prevents accidental exposure of columns such as email when a report does not need them.', '好的查询输出应该窄而明确。只返回 first_name、last_name、salary 比返回员工全字段更容易阅读，也能避免在不需要时暴露 email 等列。', 'SELECT first_name, last_name, salary\nFROM employees;', 'Could someone understand the output without knowing the table schema?', '不看表结构，别人能理解你的输出吗？'),
      c('Aliases', '别名 AS', 'Aliases rename output columns or tables for the current query.', '别名只在当前查询中给输出列或表改名。', 'Use AS for calculated columns and human-facing reports. Table aliases such as e for employees make JOIN queries shorter, but aliases should stay obvious. Prefer descriptive column aliases when a result will be read by a person.', '计算列和面向人的报表建议用 AS。表别名如 e 可以让 JOIN 更短，但别名要容易看懂。结果给人看时，列别名最好描述清楚。', 'SELECT first_name || \' \' || last_name AS full_name,\n       salary AS annual_salary\nFROM employees;', 'Which aliases are for humans, and which are for shorter SQL?', '哪些别名是给人看的，哪些只是为了缩短 SQL？'),
      c('DISTINCT', 'DISTINCT 去重', 'DISTINCT removes duplicate rows from the selected columns.', 'DISTINCT 对 SELECT 后的整组列去重。', 'DISTINCT is excellent for profiling a column: which countries appear in customers, or which categories appear in products. Remember that DISTINCT city, country removes duplicate city-country pairs, not duplicate city alone.', 'DISTINCT 很适合画像：customers 中有哪些 country，products 中有哪些 category。注意 DISTINCT city, country 去重的是城市+国家组合，不是只按 city 去重。', 'SELECT DISTINCT country FROM customers;\nSELECT DISTINCT city, country FROM customers;', 'If you add one more selected column, does the uniqueness question change?', '如果多选一列，去重问题是否已经变了？'),
    ],
    pitfalls: { en: ['DISTINCT applies to the whole selected row.', 'Aliases do not rename stored columns.'], zh: ['DISTINCT 作用于整行输出组合。', '别名不会修改数据库中真实列名。'] },
    readingRefs: ['Practical SQL Ch.2', 'Pocket Guide SELECT', 'Cookbook 1.1'],
  },
  {
    title: { en: 'WHERE Filtering and Boolean Logic', zh: 'WHERE 过滤与布尔逻辑' },
    minutes: 36,
    objectives: {
      en: ['Filter rows with comparison operators', 'Combine conditions with AND and OR', 'Use IN and BETWEEN for readable filters'],
      zh: ['用比较运算符过滤行', '用 AND 和 OR 组合条件', '用 IN 和 BETWEEN 写清晰过滤条件'],
    },
    concepts: [
      c('WHERE Chooses Rows', 'WHERE 选择行', 'WHERE runs before the final result is displayed.', 'WHERE 在最终显示结果前筛选行。', 'The WHERE clause keeps rows whose condition evaluates to true. Strings use single quotes. Numeric comparisons do not need quotes. Treat WHERE as the place where you translate the business question into a row-level test.', 'WHERE 保留条件为 true 的行。字符串用单引号，数字比较不需要引号。可以把 WHERE 看成把业务问题翻译成“每一行是否留下”的测试。', "SELECT * FROM employees\nWHERE salary > 80000;\n\nSELECT * FROM customers\nWHERE country = 'USA';", 'Can this condition be evaluated for one row at a time?', '这个条件能否对单行逐行判断？'),
      c('AND, OR, Parentheses', 'AND、OR 与括号', 'Parentheses make mixed logic readable and correct.', '括号让混合逻辑既可读又正确。', 'AND narrows a result because all conditions must be true. OR broadens it because any condition may be true. SQL gives AND higher precedence than OR, so use parentheses whenever the English sentence contains both.', 'AND 会收窄结果，因为所有条件都要成立；OR 会放宽结果，因为任一条件成立即可。SQL 中 AND 优先级高于 OR，所以中英文题目里同时出现二者时建议加括号。', "SELECT * FROM products\nWHERE category = 'Electronics'\n  AND (unit_price < 50 OR stock_qty > 100);", 'What rows would be added or removed if the parentheses disappeared?', '如果去掉括号，会多出或少掉哪些行？'),
      c('IN and BETWEEN', 'IN 与 BETWEEN', 'Use compact operators when they match the idea.', '当题意匹配时，用更紧凑的运算符。', 'IN is cleaner than a chain of OR comparisons against the same column. BETWEEN includes both endpoints, which is convenient for closed numeric or date ranges. Be explicit when endpoint inclusion matters.', '同一列匹配多个值时，IN 比一串 OR 更清楚。BETWEEN 包含两个边界，适合闭区间数字或日期范围；边界是否包含很重要时要明确说明。', "SELECT * FROM orders\nWHERE status IN ('completed', 'shipped');\n\nSELECT * FROM employees\nWHERE salary BETWEEN 70000 AND 90000;", 'Does your range include both endpoints?', '你的范围是否包含两个端点？'),
    ],
    pitfalls: { en: ['Do not mix AND and OR without parentheses.', 'Use single quotes for text literals.'], zh: ['AND 和 OR 混用时不要省略括号。', '文本字面量使用单引号。'] },
    readingRefs: ['Head First SQL Ch.2', 'Pocket Guide WHERE', 'Cookbook 2.1'],
  },
  {
    title: { en: 'Sorting with ORDER BY and LIMIT', zh: 'ORDER BY 排序与 LIMIT' },
    minutes: 32,
    objectives: {
      en: ['Sort by one or more columns', 'Choose ASC or DESC intentionally', 'Use LIMIT for top-N exploration'],
      zh: ['按一列或多列排序', '有意识地选择 ASC 或 DESC', '用 LIMIT 做 Top-N 探索'],
    },
    concepts: [
      c('ORDER BY Is Output Order', 'ORDER BY 决定输出顺序', 'Sorting is a presentation instruction, not a storage promise.', '排序是输出要求，不是存储承诺。', 'Without ORDER BY, a database may return rows in any convenient order. ORDER BY belongs near the end of a query because it acts after filtering and grouping. Always include it when a question says biggest, newest, first, last, top, or bottom.', '没有 ORDER BY，数据库可以用任何方便的顺序返回行。ORDER BY 通常靠近查询末尾，因为它在过滤和分组后作用。题目出现最大、最新、第一、最后、Top 等词时要想到排序。', 'SELECT first_name, salary\nFROM employees\nORDER BY salary DESC;', 'Which word in the question implies a sort?', '题目中哪个词暗示了排序？'),
      c('Multi-Column Sort', '多列排序', 'Later sort keys break ties from earlier keys.', '后面的排序键用于打破前面排序键的并列。', 'ORDER BY dept_id, salary DESC first groups the output by department id, then sorts employees within each department by salary. This is different from sorting globally by salary and then showing dept_id.', 'ORDER BY dept_id, salary DESC 会先按部门分块，再在部门内按工资降序。它不同于全局按工资排序后再显示部门。', 'SELECT dept_id, first_name, salary\nFROM employees\nORDER BY dept_id ASC, salary DESC;', 'What tie is the second sort key resolving?', '第二个排序键在解决哪一种并列？'),
      c('LIMIT for Focus', 'LIMIT 聚焦结果', 'LIMIT keeps the first N rows after sorting.', 'LIMIT 保留排序后的前 N 行。', 'LIMIT without ORDER BY is only a sample, not a top-N query. For learning, LIMIT makes result sets less noisy. For analysis, pair it with the ORDER BY that defines what top means.', '没有 ORDER BY 的 LIMIT 只是抽样，不是 Top-N。学习时 LIMIT 可以降低噪音；分析时必须配合 ORDER BY 定义“Top”的含义。', 'SELECT product_name, unit_price\nFROM products\nORDER BY unit_price DESC\nLIMIT 3;', 'Is this a sample or a ranked top-N answer?', '这是抽样，还是有排名依据的 Top-N？'),
    ],
    pitfalls: { en: ['LIMIT is applied after ORDER BY in SQLite.', 'Ties may make top-N results unstable unless you add another sort key.'], zh: ['SQLite 中 LIMIT 作用在 ORDER BY 之后。', '并列值会让 Top-N 不稳定，可加第二排序键。'] },
    readingRefs: ['Practical SQL Ch.2', 'Pocket Guide ORDER BY', 'Cookbook 1.4'],
  },
  {
    title: { en: 'LIKE, NULL, and COALESCE', zh: 'LIKE、NULL 与 COALESCE' },
    minutes: 38,
    objectives: {
      en: ['Match text patterns with LIKE', 'Test missing values with IS NULL', 'Replace missing display values with COALESCE'],
      zh: ['用 LIKE 匹配文本模式', '用 IS NULL 判断缺失值', '用 COALESCE 替换显示用缺失值'],
    },
    concepts: [
      c('LIKE Patterns', 'LIKE 模式匹配', 'LIKE answers partial text questions.', 'LIKE 用来回答局部文本匹配问题。', '% matches any number of characters and _ matches one character. A leading wildcard such as %Desk can be convenient but may prevent index use in larger databases. In this small SQLite course database, focus on meaning first.', '% 匹配任意长度字符，_ 匹配单个字符。以通配符开头如 %Desk 很方便，但在大数据库中可能无法利用索引。本课程先关注语义。', "SELECT * FROM products\nWHERE product_name LIKE '%Desk%';", 'Should the pattern match the beginning, end, or anywhere?', '模式应该匹配开头、结尾，还是任意位置？'),
      c('NULL Is Unknown', 'NULL 是未知', 'NULL is not zero and not an empty string.', 'NULL 不是 0，也不是空字符串。', 'NULL means the value is missing or unknown. Comparisons such as salary = NULL do not return true; use IS NULL or IS NOT NULL. This matters in employees because Jack has a missing salary.', 'NULL 表示值缺失或未知。salary = NULL 不会得到 true；应使用 IS NULL 或 IS NOT NULL。employees 中 Jack 的 salary 缺失，适合观察这一点。', 'SELECT first_name, salary\nFROM employees\nWHERE salary IS NULL;', 'Would an unknown value pass a normal equality test?', '未知值能通过普通等值判断吗？'),
      c('COALESCE for Defaults', 'COALESCE 默认值', 'COALESCE returns the first non-NULL expression.', 'COALESCE 返回第一个非 NULL 表达式。', 'Use COALESCE when the display or calculation needs a fallback. Be careful: replacing NULL salary with 0 changes analytical meaning, so label it clearly and avoid hiding missingness when data quality matters.', '当展示或计算需要兜底值时使用 COALESCE。注意：把 NULL salary 替换成 0 会改变分析含义，因此要明确标注，不要在数据质量重要时掩盖缺失。', "SELECT first_name,\n       COALESCE(salary, 0) AS salary_for_display\nFROM employees;", 'Are you fixing display, or changing analytical meaning?', '你是在修复展示，还是改变分析含义？'),
    ],
    pitfalls: { en: ['Never write = NULL; use IS NULL.', 'COALESCE can hide data-quality problems if used casually.'], zh: ['不要写 = NULL；使用 IS NULL。', '随手使用 COALESCE 可能掩盖数据质量问题。'] },
    readingRefs: ['Head First SQL Ch.3', 'Cookbook 2.5', 'Pocket Guide NULL', 'Practical SQL Ch.3'],
  },
  {
    title: { en: 'Data Types and CAST', zh: '数据类型与 CAST' },
    minutes: 34,
    objectives: {
      en: ['Identify INTEGER, REAL, TEXT, and NULL in the schema', 'Use CAST for explicit conversion', 'Understand SQLite date storage as ISO text'],
      zh: ['识别 schema 中的 INTEGER、REAL、TEXT 和 NULL', '用 CAST 做显式转换', '理解 SQLite 中 ISO 文本日期的存储方式'],
    },
    concepts: [
      c('SQLite Type Affinity', 'SQLite 类型亲和性', 'SQLite is flexible, but your thinking should be strict.', 'SQLite 很灵活，但你的思维要严格。', 'SQLite allows dynamic typing more than many production databases. Still, salary and unit_price are numeric, hire_date and order_date are ISO text dates, and ids are integers. Treat these roles consistently so your SQL transfers to stricter systems.', 'SQLite 比很多生产数据库更宽松。但 salary 和 unit_price 是数值，hire_date 和 order_date 是 ISO 文本日期，id 是整数。保持这些角色一致，SQL 才更容易迁移到严格系统。', 'SELECT typeof(salary), typeof(hire_date)\nFROM employees\nLIMIT 3;', 'What type does the operation expect?', '这个操作期待什么类型？'),
      c('CAST Explicitly', '显式 CAST', 'CAST documents that you intend a conversion.', 'CAST 表明你有意进行类型转换。', 'Implicit conversions can work until they do not. CAST(expression AS INTEGER) or CAST(expression AS TEXT) makes intent visible. Use it when formatting outputs or when a comparison depends on a specific type.', '隐式转换有时能工作，但不可靠。CAST(expression AS INTEGER) 或 CAST(expression AS TEXT) 能显式表达意图。格式化输出或比较依赖特定类型时应使用。', 'SELECT product_name,\n       CAST(unit_price AS INTEGER) AS price_floor\nFROM products;', 'Would this query still be clear without CAST?', '没有 CAST 时，这个查询意图还清楚吗？'),
      c('Dates as ISO Text', '日期作为 ISO 文本', 'YYYY-MM-DD text sorts like dates.', 'YYYY-MM-DD 文本可以按日期顺序排序。', 'This course stores dates as TEXT in ISO format. That makes lexical comparisons such as order_date >= 2024-02-01 useful. If formats are inconsistent, text sorting breaks and you must parse or clean the dates first.', '本课程把日期以 ISO 格式 TEXT 存储。因此 order_date >= 2024-02-01 这样的字符串比较可用。如果格式不一致，文本排序会失效，必须先解析或清洗。', "SELECT order_id, order_date\nFROM orders\nWHERE order_date >= '2024-02-01';", 'Are all date strings in the same format?', '所有日期字符串格式是否一致？'),
    ],
    pitfalls: { en: ['Do not rely on SQLite flexibility as a general SQL habit.', 'Non-ISO date text will sort incorrectly.'], zh: ['不要把 SQLite 的宽松当成通用 SQL 习惯。', '非 ISO 日期文本排序会出错。'] },
    readingRefs: ['Practical SQL Ch.4', 'Pocket Guide Data Types', 'Cookbook 2.8'],
  },
  {
    title: { en: 'INSERT, UPDATE, and DELETE', zh: 'INSERT、UPDATE 与 DELETE' },
    minutes: 42,
    objectives: {
      en: ['Insert rows with explicit column lists', 'Update rows with a restrictive WHERE clause', 'Delete rows only after previewing the target'],
      zh: ['用显式列清单插入行', '带严格 WHERE 修改行', '删除前先预览目标行'],
    },
    concepts: [
      c('INSERT with Column Lists', '带列清单 INSERT', 'Column lists protect you from schema-order mistakes.', '列清单可以避免列顺序错误。', 'INSERT INTO table (columns) VALUES (...) is clearer than relying on the table column order. In learning databases, ids may be manual; in production, many ids are generated automatically. The habit that matters is naming the columns you are supplying.', 'INSERT INTO table (columns) VALUES (...) 比依赖表列顺序更清楚。学习库里 id 可能手动填写；生产中很多 id 自动生成。关键习惯是写出你提供了哪些列。', "INSERT INTO customers (customer_id, name, city, country)\nVALUES (6, 'Wayne Enterprises', 'Gotham', 'USA');", 'What constraint could reject this row?', '哪种约束可能拒绝这行？'),
      c('UPDATE Requires a Target', 'UPDATE 必须锁定目标', 'UPDATE without WHERE updates every row.', '没有 WHERE 的 UPDATE 会修改每一行。', 'Before running UPDATE, write a SELECT with the same WHERE clause and inspect the target rows. Then change SELECT to UPDATE. This two-step habit reduces the chance of destructive broad updates.', '执行 UPDATE 前，先用同样 WHERE 写 SELECT 检查目标行，再改成 UPDATE。这个两步习惯能降低灾难性全表修改风险。', "SELECT * FROM products WHERE product_id = 2;\nUPDATE products\nSET unit_price = 34.99\nWHERE product_id = 2;", 'Have you previewed exactly the rows that will change?', '你是否预览过将被修改的准确行？'),
      c('DELETE Is Not DROP', 'DELETE 不是 DROP', 'DELETE removes rows; DROP removes the object.', 'DELETE 删除行，DROP 删除对象。', 'DELETE FROM orders WHERE status = cancelled removes matching rows but leaves the orders table. DROP TABLE orders removes the table definition and data. Use DELETE with a WHERE clause and verify row counts carefully.', 'DELETE FROM orders WHERE status = cancelled 删除匹配行，但保留 orders 表。DROP TABLE orders 删除表定义和数据。使用 DELETE 时要带 WHERE 并仔细确认行数。', "DELETE FROM orders\nWHERE status = 'cancelled' AND order_id = 107;", 'Would a SELECT with the same WHERE show only disposable rows?', '同样 WHERE 的 SELECT 是否只显示可删除行？'),
    ],
    pitfalls: { en: ['Preview UPDATE and DELETE targets with SELECT first.', 'Foreign keys may reject inserts or deletes.'], zh: ['UPDATE/DELETE 前先用 SELECT 预览目标。', '外键可能拒绝插入或删除。'] },
    readingRefs: ['Head First SQL Ch.4', 'Practical SQL Ch.5', 'Cookbook 1.2', 'Pocket Guide DML'],
  },
  {
    title: { en: 'CREATE TABLE and Basic Constraints', zh: 'CREATE TABLE 与基础约束' },
    minutes: 38,
    objectives: {
      en: ['Create a table with meaningful columns', 'Apply PRIMARY KEY, NOT NULL, and DEFAULT', 'Understand DROP TABLE risk'],
      zh: ['创建有意义列的表', '应用 PRIMARY KEY、NOT NULL 和 DEFAULT', '理解 DROP TABLE 风险'],
    },
    concepts: [
      c('DDL Defines Shape', 'DDL 定义形状', 'CREATE TABLE describes what rows are allowed to look like.', 'CREATE TABLE 描述允许存入什么样的行。', 'DDL statements change database structure. A good table definition names the entity, gives every row an identifier, and marks required facts with NOT NULL. Think of schema design as writing rules for future data.', 'DDL 语句改变数据库结构。好的表定义会命名实体、给每行标识符，并用 NOT NULL 标记必需事实。可以把 schema 设计看成给未来数据写规则。', 'CREATE TABLE IF NOT EXISTS suppliers (\n  supplier_id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  contact_email TEXT\n);', 'What does one row in this new table mean?', '新表的一行代表什么？'),
      c('Defaults and Required Fields', '默认值与必填字段', 'Constraints make bad data harder to store.', '约束让坏数据更难进入数据库。', 'NOT NULL says a value must be present. DEFAULT supplies a value when the insert omits it. These are not just syntax features; they encode assumptions about the business process.', 'NOT NULL 表示必须有值。DEFAULT 在插入省略该列时提供默认值。这不只是语法，而是在编码业务流程假设。', "CREATE TABLE IF NOT EXISTS product_notes (\n  note_id INTEGER PRIMARY KEY,\n  product_id INTEGER NOT NULL,\n  note TEXT NOT NULL,\n  active INTEGER DEFAULT 1\n);", 'Which fields are truly required at creation time?', '创建记录时哪些字段真的必须存在？'),
      c('DROP TABLE', 'DROP TABLE', 'DROP removes the table and its data.', 'DROP 会删除表及其数据。', 'In a practice browser database, DROP TABLE is recoverable by refreshing. In real systems, it can be catastrophic. Prefer IF EXISTS for repeatable scripts, and separate destructive cleanup from normal learning queries.', '在浏览器练习库里，DROP TABLE 可通过刷新恢复；在真实系统中可能是灾难。可用 IF EXISTS 写可重复脚本，并把破坏性清理与普通学习查询分开。', 'DROP TABLE IF EXISTS product_notes;', 'Is this a temporary practice table or production data?', '这是临时练习表，还是生产数据？'),
    ],
    pitfalls: { en: ['SQLite accepts many type names but does not enforce them like stricter databases.', 'DROP TABLE is structural deletion, not row deletion.'], zh: ['SQLite 接受很多类型名，但不像严格数据库那样强制。', 'DROP TABLE 是结构删除，不是行删除。'] },
    readingRefs: ['Practical SQL Ch.5', 'Head First SQL Ch.5', 'Pocket Guide DDL'],
  },
  {
    title: { en: 'Primary Keys and Foreign Keys', zh: '主键与外键' },
    minutes: 36,
    objectives: {
      en: ['Identify primary keys in each practice table', 'Follow foreign keys between tables', 'Explain referential integrity'],
      zh: ['识别每张练习表的主键', '沿外键追踪表关系', '解释参照完整性'],
    },
    concepts: [
      c('Primary Keys', '主键', 'A primary key identifies one row.', '主键标识唯一一行。', 'employees.emp_id, orders.order_id, and products.product_id are primary keys. They are stable handles for rows, better than names because names can repeat or change. Use keys when joining or updating a specific row.', 'employees.emp_id、orders.order_id、products.product_id 都是主键。它们是行的稳定把手，比姓名更适合，因为姓名可能重复或变化。JOIN 或修改特定行时应使用键。', 'SELECT emp_id, first_name, last_name\nFROM employees\nORDER BY emp_id;', 'What column uniquely identifies this row?', '哪一列唯一标识这一行？'),
      c('Foreign Keys', '外键', 'A foreign key points to a row in another table.', '外键指向另一张表的一行。', 'employees.dept_id points to departments.dept_id. orders.customer_id points to customers.customer_id. Foreign keys let normalized tables avoid repeating full department or customer details on every child row.', 'employees.dept_id 指向 departments.dept_id；orders.customer_id 指向 customers.customer_id。外键让规范化表不用在每个子行重复完整部门或客户信息。', 'SELECT e.first_name, e.dept_id, d.dept_name\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id;', 'Which side stores the reference?', '哪一侧存储引用？'),
      c('Referential Integrity', '参照完整性', 'References should point to rows that exist.', '引用应该指向真实存在的行。', 'Referential integrity prevents orphaned child rows, such as an order for a customer_id that does not exist. SQLite requires foreign key enforcement to be enabled, but the concept is central in every relational database.', '参照完整性防止孤儿子行，例如订单指向不存在的 customer_id。SQLite 需要开启外键检查，但这个概念在所有关系型数据库中都核心。', 'PRAGMA foreign_keys = ON;', 'What would break if the parent row disappeared?', '如果父行消失，什么会被破坏？'),
    ],
    pitfalls: { en: ['Do not join on names when ids exist.', 'Foreign keys live on the many-side child table.'], zh: ['有 id 时不要用名称 JOIN。', '外键通常在多的一侧/子表上。'] },
    readingRefs: ['Practical SQL Ch.5', 'Head First SQL Ch.5', 'Cookbook 3.1'],
  },
  {
    title: { en: 'Relationships and JOIN Preparation', zh: '表关系与 JOIN 预备' },
    minutes: 34,
    objectives: {
      en: ['Describe one-to-many relationships', 'Choose a join path before writing SQL', 'Understand why normalized data must be recombined'],
      zh: ['描述一对多关系', '写 SQL 前选择 JOIN 路径', '理解规范化数据为什么需要重新组合'],
    },
    concepts: [
      c('One-to-Many', '一对多', 'One parent row can relate to many child rows.', '一个父行可以关联多个子行。', 'One department can have many employees. One customer can have many orders. One order can have many order_items. Recognizing one-to-many relationships helps you predict whether a JOIN will duplicate rows.', '一个部门可以有多名员工；一个客户可以有多张订单；一张订单可以有多条明细。识别一对多关系可以帮助预测 JOIN 后行数是否会增加。', 'SELECT dept_id, COUNT(*)\nFROM employees\nGROUP BY dept_id;', 'Which table is the parent, and which is the child?', '哪张表是父表，哪张表是子表？'),
      c('Join Paths', 'JOIN 路径', 'A join path is the route from the table you have to the table you need.', 'JOIN 路径是从已有表走到所需表的路线。', 'To show product names for orders, you cannot jump directly from orders to products in this schema. The route is orders to order_items to products. Writing the path first prevents missing joins and accidental Cartesian products.', '要显示订单中的商品名，不能从 orders 直接跳到 products。本 schema 的路线是 orders -> order_items -> products。先写路径能避免漏 JOIN 和意外笛卡尔积。', 'orders.order_id -> order_items.order_id -> products.product_id', 'What bridge table connects the entities?', '哪个桥接表连接这些实体？'),
      c('Normalize Then Recombine', '规范化后再组合', 'Databases avoid repetition, queries rebuild context.', '数据库避免重复，查询负责重建上下文。', 'Storing dept_name only in departments avoids update anomalies. A query then recombines employees with departments when you need a human-readable report. This is the central trade-off of relational design.', 'dept_name 只存在 departments 中，可以避免更新异常。需要人类可读报表时，再通过查询把 employees 和 departments 组合起来。这是关系设计的核心权衡。', 'SELECT emp_id, first_name, dept_id\nFROM employees\nWHERE dept_id = 1;\n\nSELECT dept_name\nFROM departments\nWHERE dept_id = 1;', 'What repeated data is normalization avoiding?', '规范化避免了哪些重复数据？'),
    ],
    pitfalls: { en: ['Joining across the wrong path changes the question.', 'One-to-many joins can multiply rows before aggregation.'], zh: ['错误 JOIN 路径会改变问题。', '一对多 JOIN 会在聚合前放大行数。'] },
    readingRefs: ['Head First SQL Ch.6', 'Practical SQL Ch.6', 'Cookbook 3.2'],
  },
  {
    title: { en: 'INNER JOIN', zh: 'INNER JOIN 内连接' },
    minutes: 38,
    objectives: {
      en: ['Write an INNER JOIN with ON', 'Use table aliases clearly', 'Predict which rows are excluded'],
      zh: ['用 ON 编写 INNER JOIN', '清晰使用表别名', '预测哪些行会被排除'],
    },
    concepts: [
      c('Match Rows with ON', '用 ON 匹配行', 'INNER JOIN keeps only successful matches.', 'INNER JOIN 只保留匹配成功的行。', 'The ON clause states how rows correspond. employees.dept_id = departments.dept_id means each employee row looks for its department row. If no match exists, INNER JOIN removes that employee from the result.', 'ON 子句说明行如何对应。employees.dept_id = departments.dept_id 表示每个员工行寻找自己的部门行。如果没有匹配，INNER JOIN 会把该员工从结果中移除。', 'SELECT e.first_name, e.last_name, d.dept_name\nFROM employees e\nINNER JOIN departments d ON e.dept_id = d.dept_id;', 'What row disappears if the match is missing?', '如果匹配不存在，哪一行会消失？'),
      c('Aliases Reduce Noise', '别名降低噪音', 'Aliases make qualified columns readable.', '别名让带表名前缀的列更可读。', 'Once two tables appear in FROM, qualify columns that could be ambiguous. e.first_name and d.dept_name communicate source clearly. Short aliases are fine when the query is small; use more descriptive aliases in long reports.', 'FROM 中出现两张表后，可能歧义的列应加限定。e.first_name 和 d.dept_name 能清楚说明来源。小查询可用短别名，长报表可用更描述性的别名。', 'SELECT c.name, o.order_id, o.total_amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id;', 'Can a reader tell which table each column comes from?', '读者能看出每列来自哪张表吗？'),
      c('Filter After Joining', 'JOIN 后过滤', 'WHERE filters the matched result.', 'WHERE 过滤匹配后的结果。', 'Use ON for relationship logic and WHERE for row filters. This separation makes the query easier to reason about. For INNER JOIN, some filters can be placed in ON with the same result, but WHERE usually expresses intent better.', '用 ON 表达关系逻辑，用 WHERE 表达行过滤。这样更容易推理。对 INNER JOIN，有些过滤放 ON 结果也一样，但 WHERE 通常更能表达意图。', "SELECT c.name, o.order_id, o.total_amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nWHERE o.status = 'completed';", 'Is this condition defining the relationship or filtering the result?', '这个条件是在定义关系，还是过滤结果？'),
    ],
    pitfalls: { en: ['A missing ON can create a Cartesian product.', 'INNER JOIN hides unmatched rows.'], zh: ['缺少 ON 可能产生笛卡尔积。', 'INNER JOIN 会隐藏未匹配行。'] },
    readingRefs: ['Head First SQL Ch.7', 'Cookbook 3.3', 'Pocket Guide JOIN'],
  },
  {
    title: { en: 'LEFT JOIN', zh: 'LEFT JOIN 左连接' },
    minutes: 36,
    objectives: {
      en: ['Preserve all rows from the left table', 'Find missing related rows', 'Place filters carefully with outer joins'],
      zh: ['保留左表所有行', '找出缺失的关联行', '谨慎放置外连接过滤条件'],
    },
    concepts: [
      c('Preserve the Left Side', '保留左侧', 'LEFT JOIN returns every left-table row.', 'LEFT JOIN 返回左表每一行。', 'LEFT JOIN is useful when absence matters. It keeps the left table row even if the right table has no match, filling right-side columns with NULL. Choose the left table based on what must not disappear.', '当“没有”也重要时，LEFT JOIN 很有用。即使右表没有匹配，它也保留左表行，并把右侧列填成 NULL。根据“什么不能消失”选择左表。', 'SELECT e.first_name, d.dept_name\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.dept_id;', 'Which table must be preserved completely?', '哪张表必须完整保留？'),
      c('Anti-Join Pattern', '反连接模式', 'LEFT JOIN plus IS NULL finds missing matches.', 'LEFT JOIN 加 IS NULL 找缺失匹配。', 'To find rows with no related row, left join to the related table and filter where the right key is NULL. This is common for customers with no orders, products never sold, or employees without a department.', '要找没有关联行的数据，先 LEFT JOIN 到关联表，再过滤右表 key IS NULL。常见问题包括未下单客户、从未售出的产品、没有部门的员工。', 'SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NULL;', 'Are you checking a right-side key that would be non-NULL on a match?', '你检查的右侧 key 是否在匹配时必定非 NULL？'),
      c('ON vs WHERE in LEFT JOIN', 'LEFT JOIN 中 ON 与 WHERE', 'Filtering the right table in WHERE can erase preserved rows.', '在 WHERE 过滤右表可能抹掉被保留的行。', 'A WHERE condition on a right-table column often turns a LEFT JOIN into INNER JOIN behavior because NULL right-side rows fail the condition. Put match restrictions in ON when you still need unmatched left rows.', 'WHERE 中对右表列加条件，常常让 LEFT JOIN 表现得像 INNER JOIN，因为右侧 NULL 行无法通过条件。如果仍要保留未匹配左行，应把匹配限制放到 ON。', "SELECT c.name, o.order_id\nFROM customers c\nLEFT JOIN orders o\n  ON c.customer_id = o.customer_id\n AND o.status = 'completed';", 'Should unmatched left rows survive this filter?', '未匹配的左表行是否应该保留？'),
    ],
    pitfalls: { en: ['A right-table WHERE filter can cancel the outer join.', 'SQLite has no RIGHT JOIN; swap table order.'], zh: ['右表 WHERE 过滤可能抵消外连接效果。', 'SQLite 没有 RIGHT JOIN；交换表顺序即可。'] },
    readingRefs: ['Cookbook 3.4', 'Head First SQL Ch.8', 'Practical SQL Ch.6'],
  },
  {
    title: { en: 'Self Joins and Multi-Table Joins', zh: '自连接与多表连接' },
    minutes: 42,
    objectives: {
      en: ['Join a table to itself with separate aliases', 'Chain joins across three or more tables', 'Debug join row counts step by step'],
      zh: ['用不同别名把表连接到自身', '串联三张及以上表', '逐步调试 JOIN 行数'],
    },
    concepts: [
      c('Self Join', '自连接', 'The same table can play two roles.', '同一张表可以扮演两个角色。', 'employees has manager_id, which points back to employees.emp_id. Use two aliases: e for the employee role, m for the manager role. The aliases are not optional because SQL must distinguish the two copies.', 'employees 有 manager_id，指回 employees.emp_id。使用两个别名：e 表示员工角色，m 表示经理角色。别名不是可选的，因为 SQL 必须区分同一表的两份角色。', 'SELECT e.first_name AS employee,\n       m.first_name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.emp_id;', 'What role does each alias play?', '每个别名扮演什么角色？'),
      c('Chain Joins', '链式 JOIN', 'Add one relationship at a time.', '一次添加一条关系。', 'For order detail reports, start with order_items because it has the line-item grain, then join orders, customers, and products. Build and run the query after each join to catch row explosions early.', '订单明细报表应从 order_items 开始，因为它是明细粒度；再连接 orders、customers、products。每加一个 JOIN 就运行一次，及早发现行数爆炸。', 'SELECT c.name, o.order_date, p.product_name, oi.quantity\nFROM order_items oi\nJOIN orders o ON oi.order_id = o.order_id\nJOIN customers c ON o.customer_id = c.customer_id\nJOIN products p ON oi.product_id = p.product_id;', 'What is the result grain after all joins?', '所有 JOIN 后结果粒度是什么？'),
      c('Row-Count Debugging', '行数调试', 'Unexpected row counts reveal relationship mistakes.', '异常行数能暴露关系错误。', 'When a join result is too large, look for missing ON clauses or joining through the wrong key. When it is too small, ask whether an INNER JOIN removed unmatched rows. COUNT(*) after each step is a simple diagnostic.', 'JOIN 结果过大时，检查是否缺 ON 或用错 key；结果过小时，检查 INNER JOIN 是否移除了未匹配行。每一步 COUNT(*) 是简单有效的诊断。', 'SELECT COUNT(*) FROM order_items;\nSELECT COUNT(*)\nFROM order_items oi\nJOIN orders o ON oi.order_id = o.order_id;', 'Did the row count change for a reason you can explain?', '行数变化是否有可解释原因？'),
    ],
    pitfalls: { en: ['Self joins require distinct aliases.', 'Join from the table that matches the desired result grain.'], zh: ['自连接必须使用不同别名。', '从符合目标粒度的表开始 JOIN。'] },
    readingRefs: ['Cookbook 3.5', 'Head First SQL Ch.9', 'Pocket Guide JOIN'],
  },
  {
    title: { en: 'Subqueries', zh: '子查询' },
    minutes: 38,
    objectives: {
      en: ['Use scalar and multi-row subqueries', 'Place subqueries in WHERE or FROM', 'Compare subqueries with joins'],
      zh: ['使用标量和多行子查询', '在 WHERE 或 FROM 中放置子查询', '比较子查询与 JOIN'],
    },
    concepts: [
      c('Scalar Subquery', '标量子查询', 'A scalar subquery returns one value.', '标量子查询返回一个值。', 'Use a scalar subquery when the outer query needs a dynamic threshold, such as employees above the company average salary. The inner query must return exactly one column and one row for scalar comparison.', '当外层查询需要动态阈值时使用标量子查询，例如高于公司平均工资的员工。用于标量比较时，内层查询必须返回一列一行。', 'SELECT first_name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);', 'Does the inner query produce one value?', '内层查询是否只产生一个值？'),
      c('IN Subquery', 'IN 子查询', 'IN accepts a one-column list from a subquery.', 'IN 可以接收子查询返回的一列列表。', 'A multi-row subquery works naturally with IN. For example, first find departments in San Francisco, then keep employees whose dept_id is in that list. This mirrors a two-step thought process.', '多行子查询很适合搭配 IN。例如先找 San Francisco 的部门，再保留 dept_id 在该列表中的员工。这对应一个两步思考过程。', "SELECT * FROM employees\nWHERE dept_id IN (\n  SELECT dept_id FROM departments WHERE location = 'San Francisco'\n);", 'Is the subquery returning one column?', '子查询是否只返回一列？'),
      c('Derived Tables', '派生表', 'A FROM subquery becomes a temporary table.', 'FROM 中的子查询会变成临时表。', 'Subqueries in FROM must have aliases because the outer query treats them like tables. Derived tables are useful when you need to filter a grouped result or reuse a calculated column in the outer query.', 'FROM 中的子查询必须有别名，因为外层查询把它当成表。派生表适合过滤分组结果，或在外层复用计算列。', 'SELECT dept_id, avg_sal\nFROM (\n  SELECT dept_id, AVG(salary) AS avg_sal\n  FROM employees\n  GROUP BY dept_id\n) dept_avg\nWHERE avg_sal > 75000;', 'What name will the outer query use for the derived table?', '外层查询用什么名字引用这个派生表？'),
    ],
    pitfalls: { en: ['Scalar subqueries must not return multiple rows.', 'A FROM subquery needs an alias.'], zh: ['标量子查询不能返回多行。', 'FROM 子查询需要别名。'] },
    readingRefs: ['Cookbook 4.1', 'Head First SQL Ch.10', 'Pocket Guide Subqueries'],
  },
  {
    title: { en: 'GROUP BY Basics', zh: 'GROUP BY 分组基础' },
    minutes: 42,
    objectives: {
      en: ['Group rows by a chosen dimension', 'Use COUNT(*) for group size', 'Select only grouped columns or aggregate expressions'],
      zh: ['按选定维度分组行', '用 COUNT(*) 统计组大小', '只选择分组列或聚合表达式'],
    },
    concepts: [
      c('Group Grain', '分组粒度', 'GROUP BY changes one row per input into one row per group.', 'GROUP BY 把输入行变成每组一行。', 'GROUP BY dept_id means the result grain is one row per department id. Every selected non-aggregate column should describe that group. This is why SELECT first_name with GROUP BY dept_id is conceptually wrong: which employee name should represent the group?', 'GROUP BY dept_id 表示结果粒度是一行一个部门 id。每个非聚合 SELECT 列都应该描述这个组。因此 SELECT first_name 同时 GROUP BY dept_id 在概念上是错的：哪个员工名代表整个组？', 'SELECT dept_id, COUNT(*) AS headcount\nFROM employees\nGROUP BY dept_id;', 'What does one output row represent after grouping?', '分组后输出一行代表什么？'),
      c('Aggregate Functions', '聚合函数', 'Aggregates summarize many rows into one value.', '聚合函数把多行汇总成一个值。', 'COUNT, SUM, AVG, MIN, and MAX are common aggregate functions. They operate within each group when GROUP BY is present, or over the whole filtered result when GROUP BY is absent.', 'COUNT、SUM、AVG、MIN、MAX 是常见聚合函数。有 GROUP BY 时它们在每组内计算；没有 GROUP BY 时，它们在整个过滤后的结果上计算。', 'SELECT COUNT(*) AS employee_count,\n       AVG(salary) AS avg_salary\nFROM employees;', 'Is the aggregate per group or over the whole filtered table?', '聚合是按组计算，还是对整个过滤表计算？'),
      c('SQL Clause Order', 'SQL 子句顺序', 'WHERE filters rows before grouping.', 'WHERE 在分组前过滤行。', 'The logical order is FROM, WHERE, GROUP BY, aggregate calculation, HAVING, SELECT, ORDER BY. Memorizing this order helps explain why aggregate functions cannot be used in WHERE.', '逻辑顺序是 FROM、WHERE、GROUP BY、聚合计算、HAVING、SELECT、ORDER BY。记住这个顺序能解释为什么聚合函数不能用于 WHERE。', "SELECT country, city, COUNT(*)\nFROM customers\nWHERE country = 'USA'\nGROUP BY country, city;", 'Does this filter happen before or after groups exist?', '这个过滤发生在分组存在之前还是之后？'),
    ],
    pitfalls: { en: ['Do not select ungrouped detail columns in grouped queries.', 'WHERE filters rows, not groups.'], zh: ['分组查询中不要选择未分组的明细列。', 'WHERE 过滤行，不过滤组。'] },
    readingRefs: ['Head First SQL Ch.11', 'Cookbook 4.2', 'Practical SQL Ch.7'],
  },
  {
    title: { en: 'GROUP BY with Joins and Grain', zh: 'JOIN 后分组与粒度' },
    minutes: 38,
    objectives: {
      en: ['Group joined results by dimension labels', 'Choose grouping columns based on business grain', 'Handle NULLs in grouped results'],
      zh: ['按维度名称分组 JOIN 结果', '根据业务粒度选择分组列', '处理分组结果中的 NULL'],
    },
    concepts: [
      c('Join Then Group', '先 JOIN 再分组', 'Join adds descriptive columns before summarizing.', 'JOIN 先补充描述列，再汇总。', 'To report headcount by department name, join employees to departments first, then group by the department label. This produces a human-readable result while preserving the key relationship.', '要按部门名报告人数，先把 employees 连接到 departments，再按部门标签分组。这样结果可读，同时保留 key 关系。', 'SELECT d.dept_name, COUNT(e.emp_id) AS headcount\nFROM departments d\nLEFT JOIN employees e ON d.dept_id = e.dept_id\nGROUP BY d.dept_id, d.dept_name;', 'Which table supplies the label, and which supplies the facts?', '哪张表提供标签，哪张表提供事实？'),
      c('Choose the Grouping Level', '选择分组层级', 'Different GROUP BY columns answer different questions.', '不同 GROUP BY 列回答不同问题。', 'Grouping products by category answers category-level inventory questions. Grouping by product_id answers product-level questions. If a query feels wrong, check whether the grouping level matches the wording of the question.', '按 category 分组回答品类级库存问题；按 product_id 分组回答商品级问题。如果查询感觉不对，检查分组层级是否匹配题目措辞。', 'SELECT category, SUM(stock_qty) AS units_in_stock\nFROM products\nGROUP BY category;', 'Is the business question asking per category, per product, or per order?', '业务问题是按品类、按商品，还是按订单？'),
      c('NULL in Groups', '分组中的 NULL', 'GROUP BY treats NULLs as one group.', 'GROUP BY 会把 NULL 归为同一组。', 'COUNT(*) includes rows even when a grouped or measured column is NULL. COUNT(salary) skips missing salaries. Use both counts when you need to expose missing data in grouped summaries.', 'COUNT(*) 会计入行，即使分组列或度量列为 NULL；COUNT(salary) 会跳过缺失工资。需要暴露分组汇总中的缺失数据时，可以同时使用两个计数。', 'SELECT dept_id,\n       COUNT(*) AS rows,\n       COUNT(salary) AS salary_values\nFROM employees\nGROUP BY dept_id;', 'Do you need to count rows or known values?', '你需要数行，还是数已知值？'),
    ],
    pitfalls: { en: ['Group by stable ids plus labels when labels may repeat.', 'COUNT(column) and COUNT(*) answer different questions.'], zh: ['标签可能重复时，按稳定 id 加标签分组。', 'COUNT(column) 和 COUNT(*) 回答不同问题。'] },
    readingRefs: ['Cookbook 4.3', 'Pocket Guide GROUP BY'],
  },
  {
    title: { en: 'HAVING Filters Groups', zh: 'HAVING 过滤分组' },
    minutes: 36,
    objectives: {
      en: ['Separate WHERE row filters from HAVING group filters', 'Filter aggregate results', 'Combine WHERE and HAVING in one query'],
      zh: ['区分 WHERE 行过滤与 HAVING 组过滤', '过滤聚合结果', '在同一查询中组合 WHERE 和 HAVING'],
    },
    concepts: [
      c('WHERE vs HAVING', 'WHERE 与 HAVING', 'WHERE happens before groups; HAVING happens after.', 'WHERE 在分组前，HAVING 在分组后。', 'If your condition mentions AVG, COUNT, SUM, MIN, or MAX, it probably belongs in HAVING because groups must exist before aggregate values exist. Row-level conditions still belong in WHERE.', '如果条件提到 AVG、COUNT、SUM、MIN、MAX，它通常属于 HAVING，因为聚合值必须在分组后才存在。行级条件仍属于 WHERE。', 'SELECT dept_id, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY dept_id\nHAVING AVG(salary) > 75000;', 'Does this condition need an aggregate value?', '这个条件是否需要聚合值？'),
      c('Filter Groups by Size', '按组大小过滤', 'HAVING COUNT(*) keeps only groups that meet a threshold.', 'HAVING COUNT(*) 只保留满足阈值的组。', 'Customer order frequency is naturally a grouped question: group orders by customer_id, count orders, then keep customers with more than one order. The HAVING clause expresses that final group-level rule.', '客户下单频率天然是分组问题：按 customer_id 分组 orders，计算订单数，再保留下单超过一次的客户。HAVING 表达最后的组级规则。', 'SELECT customer_id, COUNT(*) AS order_count\nFROM orders\nGROUP BY customer_id\nHAVING COUNT(*) > 1;', 'What is the threshold applied to: rows or groups?', '阈值作用于行，还是组？'),
      c('WHERE and HAVING Together', 'WHERE 与 HAVING 同用', 'First narrow the facts, then filter the summary.', '先收窄事实，再过滤汇总。', 'Use WHERE status = completed to exclude cancelled and pending orders before grouping. Then use HAVING SUM(total_amount) > 500 to keep high-value customer groups. This order prevents irrelevant rows from contributing to aggregates.', '先用 WHERE status = completed 排除 cancelled 和 pending 订单，再用 HAVING SUM(total_amount) > 500 保留高价值客户组。这个顺序防止无关行进入聚合。', "SELECT customer_id, SUM(total_amount) AS completed_total\nFROM orders\nWHERE status = 'completed'\nGROUP BY customer_id\nHAVING SUM(total_amount) > 500;", 'Which rows should be excluded before the summary is built?', '汇总前应排除哪些行？'),
    ],
    pitfalls: { en: ['Aggregate conditions do not belong in WHERE.', 'Non-aggregate HAVING conditions are often clearer in WHERE.'], zh: ['聚合条件不属于 WHERE。', '非聚合 HAVING 条件通常放 WHERE 更清楚。'] },
    readingRefs: ['Head First SQL Ch.12', 'Cookbook 4.4', 'Pocket Guide HAVING'],
  },
  {
    title: { en: 'Aggregate Functions', zh: '聚合函数' },
    minutes: 34,
    objectives: {
      en: ['Use COUNT, SUM, AVG, MIN, and MAX', 'Explain NULL behavior in aggregates', 'Build business metrics from order data'],
      zh: ['使用 COUNT、SUM、AVG、MIN、MAX', '解释聚合函数中的 NULL 行为', '从订单数据构建业务指标'],
    },
    concepts: [
      c('Core Aggregates', '核心聚合', 'Aggregates compress many values into one summary.', '聚合把多个值压缩成一个摘要。', 'COUNT counts, SUM adds, AVG averages, MIN and MAX find extremes. These are the building blocks of dashboards and reports. Always name the metric with an alias so the result is self-explanatory.', 'COUNT 计数，SUM 求和，AVG 求平均，MIN/MAX 找极值。它们是仪表盘和报表的基础。务必给指标起别名，让结果自解释。', 'SELECT COUNT(*) AS orders,\n       SUM(total_amount) AS revenue,\n       AVG(total_amount) AS avg_order_value\nFROM orders;', 'What business metric does each aggregate represent?', '每个聚合代表什么业务指标？'),
      c('NULL Behavior', 'NULL 行为', 'Most aggregates ignore NULL values.', '大多数聚合会忽略 NULL。', 'AVG(salary) ignores Jack because salary is NULL, while COUNT(*) includes him as a row. This is usually correct, but you should be aware of the denominator. COUNT(salary) reveals how many known salary values contributed.', 'AVG(salary) 会忽略 salary 为 NULL 的 Jack，而 COUNT(*) 会把他作为一行计入。这通常合理，但你需要知道分母是什么。COUNT(salary) 可以显示有多少已知工资参与计算。', 'SELECT COUNT(*) AS employees,\n       COUNT(salary) AS known_salaries,\n       AVG(salary) AS avg_salary\nFROM employees;', 'What denominator is your average using?', '你的平均值使用了什么分母？'),
      c('Aggregate After Join', 'JOIN 后聚合', 'Joined rows may change what is being summed.', 'JOIN 后的行会改变被求和的对象。', 'Order revenue can come from orders.total_amount or from summing order_items quantity times unit_price. Comparing both is a useful consistency check. When joining, confirm that each fact appears the number of times you expect.', '订单收入可以来自 orders.total_amount，也可以从 order_items 的 quantity * unit_price 求和。比较二者是很好的校验。JOIN 后要确认每个事实出现次数符合预期。', 'SELECT SUM(quantity * unit_price) AS item_total\nFROM order_items;', 'Could the join duplicate the fact you are summing?', 'JOIN 是否可能重复你正在求和的事实？'),
    ],
    pitfalls: { en: ['AVG ignores NULL; decide whether that is desired.', 'SUM over no rows may return NULL.'], zh: ['AVG 忽略 NULL；确认这是否符合需求。', '对空结果 SUM 可能返回 NULL。'] },
    readingRefs: ['Practical SQL Ch.7', 'Pocket Guide Aggregates', 'Cookbook 4.5'],
  },
  {
    title: { en: 'CASE Expressions', zh: 'CASE 条件表达式' },
    minutes: 36,
    objectives: {
      en: ['Create categories with searched CASE', 'Map exact values with simple CASE', 'Use CASE inside aggregates'],
      zh: ['用搜索 CASE 创建分类', '用简单 CASE 映射精确值', '在聚合中使用 CASE'],
    },
    concepts: [
      c('Searched CASE', '搜索 CASE', 'Searched CASE evaluates conditions in order.', '搜索 CASE 按顺序判断条件。', 'CASE WHEN condition THEN value lets you create readable categories directly in a query. Conditions are checked top to bottom, so put the most specific or highest-priority rules first.', 'CASE WHEN condition THEN value 可以直接在查询中创建可读分类。条件从上到下判断，因此最具体或优先级最高的规则应放前面。', "SELECT first_name, salary,\n  CASE WHEN salary >= 90000 THEN 'high'\n       WHEN salary >= 70000 THEN 'mid'\n       WHEN salary IS NULL THEN 'unknown'\n       ELSE 'entry' END AS salary_band\nFROM employees;", 'Which condition should be tested first?', '哪个条件应该最先判断？'),
      c('Simple CASE', '简单 CASE', 'Simple CASE maps one expression to known values.', '简单 CASE 把一个表达式映射到已知值。', 'CASE status WHEN completed THEN ... is compact for exact value mapping. It is less flexible than searched CASE because each branch compares the same expression for equality.', 'CASE status WHEN completed THEN ... 适合精确值映射。它不如搜索 CASE 灵活，因为每个分支都对同一表达式做等值比较。', "SELECT order_id,\n  CASE status\n    WHEN 'completed' THEN 'done'\n    WHEN 'pending' THEN 'waiting'\n    ELSE status\n  END AS status_label\nFROM orders;", 'Are all branches comparing the same expression?', '所有分支是否都在比较同一个表达式？'),
      c('Conditional Aggregation', '条件聚合', 'CASE can turn conditions into countable values.', 'CASE 可以把条件变成可计数值。', 'COUNT(CASE WHEN ... THEN 1 END) counts rows that meet a condition because non-matching rows return NULL and COUNT ignores NULL. SUM(CASE WHEN ... THEN 1 ELSE 0 END) is another common pattern.', 'COUNT(CASE WHEN ... THEN 1 END) 会统计满足条件的行，因为不满足时返回 NULL，而 COUNT 忽略 NULL。SUM(CASE WHEN ... THEN 1 ELSE 0 END) 也是常见写法。', "SELECT COUNT(CASE WHEN salary >= 90000 THEN 1 END) AS high_salary_count\nFROM employees;", 'Should non-matching rows become NULL or 0?', '不匹配的行应该变成 NULL 还是 0？'),
    ],
    pitfalls: { en: ['Remember END.', 'Handle NULL explicitly when categories need it.'], zh: ['不要忘记 END。', '分类需要时要显式处理 NULL。'] },
    readingRefs: ['Cookbook 4.6', 'Pocket Guide CASE', 'Head First SQL Ch.13'],
  },
  {
    title: { en: 'String Functions', zh: '字符串函数' },
    minutes: 36,
    objectives: {
      en: ['Use LENGTH, UPPER, LOWER, and TRIM', 'Build strings with concatenation', 'Extract and replace substrings'],
      zh: ['使用 LENGTH、UPPER、LOWER、TRIM', '用拼接构造字符串', '截取和替换子串'],
    },
    concepts: [
      c('Clean and Normalize Text', '清洗与标准化文本', 'Text functions make messy labels comparable.', '文本函数让杂乱标签可比较。', 'UPPER and LOWER normalize case. TRIM removes leading and trailing spaces. LENGTH helps profile unexpected values. These functions are simple but important in real datasets where text is rarely perfectly clean.', 'UPPER/LOWER 标准化大小写，TRIM 去除首尾空格，LENGTH 帮助画像异常值。这些函数简单但重要，因为真实数据中的文本很少完美干净。', 'SELECT UPPER(first_name), LOWER(email), LENGTH(last_name)\nFROM employees\nLIMIT 5;', 'Are you changing display, comparison, or storage?', '你是在改变展示、比较，还是存储？'),
      c('Concatenation', '字符串拼接', 'SQLite uses || to join strings.', 'SQLite 使用 || 连接字符串。', 'Concatenation builds readable labels such as full names. If any part is NULL, the whole concatenation can become NULL, so use COALESCE when optional pieces are involved.', '拼接可以构造 full name 等可读标签。如果任一部分为 NULL，整体可能变成 NULL，因此涉及可选字段时应使用 COALESCE。', "SELECT first_name || ' ' || last_name AS full_name\nFROM employees;", 'Could any part of the label be NULL?', '标签中的某个部分是否可能为 NULL？'),
      c('SUBSTR and REPLACE', 'SUBSTR 与 REPLACE', 'Extract or substitute predictable pieces of text.', '提取或替换可预测的文本片段。', 'SUBSTR(hire_date, 1, 4) extracts the year from ISO dates. REPLACE can standardize domains or labels. These operations work best when the source format is consistent.', 'SUBSTR(hire_date, 1, 4) 可以从 ISO 日期中提取年份。REPLACE 可用于标准化域名或标签。这类操作在源格式一致时最可靠。', "SELECT SUBSTR(hire_date, 1, 4) AS hire_year\nFROM employees;\n\nSELECT REPLACE(email, '@co.com', '@company.com')\nFROM employees;", 'Is the substring position stable for every row?', '每一行的截取位置都稳定吗？'),
    ],
    pitfalls: { en: ['SQLite SUBSTR starts at 1.', 'NULL concatenation can erase the whole string.'], zh: ['SQLite 的 SUBSTR 从 1 开始。', 'NULL 参与拼接可能让整串变 NULL。'] },
    readingRefs: ['Cookbook 2.6', 'Pocket Guide Strings', 'Practical SQL Ch.8'],
  },
  {
    title: { en: 'Date Functions and Date Logic', zh: '日期函数与日期逻辑' },
    minutes: 38,
    objectives: {
      en: ['Use date(), datetime(), and strftime()', 'Filter ISO dates by range', 'Group activity by month or year'],
      zh: ['使用 date()、datetime() 和 strftime()', '按范围过滤 ISO 日期', '按月份或年份汇总活动'],
    },
    concepts: [
      c('ISO Date Text', 'ISO 日期文本', 'The course stores dates as YYYY-MM-DD text.', '本课程把日期存为 YYYY-MM-DD 文本。', 'Because the format is year-month-day with zero-padded parts, text ordering matches chronological ordering. This makes simple range filters usable in SQLite for hire_date and order_date.', '由于格式是补零的 年-月-日，文本排序与时间顺序一致。因此在 SQLite 中可以对 hire_date 和 order_date 使用简单范围过滤。', "SELECT order_id, order_date\nFROM orders\nWHERE order_date >= '2024-02-01';", 'Would this comparison still work with MM/DD/YYYY?', '如果日期是 MM/DD/YYYY，这种比较还成立吗？'),
      c('strftime for Parts', 'strftime 提取部分', 'strftime turns dates into grouping keys.', 'strftime 可以把日期变成分组键。', 'Use strftime(%Y, date) for year and strftime(%Y-%m, date) for month. Once extracted, the value can be selected, grouped, or ordered like any other expression.', '用 strftime(%Y, date) 提取年份，用 strftime(%Y-%m, date) 提取月份。提取后可像其他表达式一样 SELECT、GROUP BY、ORDER BY。', "SELECT strftime('%Y-%m', order_date) AS month,\n       COUNT(*) AS orders\nFROM orders\nGROUP BY month\nORDER BY month;", 'What date part matches the business question?', '哪个日期部分匹配业务问题？'),
      c('Date Math', '日期计算', 'julianday can estimate elapsed days.', 'julianday 可估算经过天数。', 'SQLite date math is function-based. julianday(end) - julianday(start) returns a day difference. For this course, use it to reason about tenure or order age; in production, confirm timezone and timestamp rules.', 'SQLite 日期计算基于函数。julianday(end) - julianday(start) 返回天数差。本课程可用它理解任期或订单年龄；生产中要确认时区和时间戳规则。', "SELECT first_name,\n       ROUND(julianday('2024-04-01') - julianday(hire_date)) AS days_employed\nFROM employees;", 'Are you comparing dates or timestamps with time zones?', '你比较的是日期，还是带时区的时间戳？'),
    ],
    pitfalls: { en: ['Date functions depend on consistent input formats.', 'Timezone rules are outside this small practice schema.'], zh: ['日期函数依赖一致输入格式。', '本小型练习 schema 不处理时区规则。'] },
    readingRefs: ['Cookbook 2.7', 'Practical SQL Ch.8', 'Pocket Guide Dates'],
  },
  {
    title: { en: 'UNION and Set Operations', zh: 'UNION 与集合运算' },
    minutes: 34,
    objectives: {
      en: ['Combine compatible SELECT results', 'Choose UNION or UNION ALL', 'Sort the final combined result'],
      zh: ['合并兼容的 SELECT 结果', '选择 UNION 或 UNION ALL', '排序最终合并结果'],
    },
    concepts: [
      c('Compatible Result Shapes', '兼容结果形状', 'UNION stacks rows from matching SELECT lists.', 'UNION 把形状匹配的 SELECT 结果上下堆叠。', 'Each SELECT in a UNION must return the same number of columns in compatible positions. Column names in the final result usually come from the first SELECT, so alias that first SELECT intentionally.', 'UNION 中每个 SELECT 必须返回相同列数，且对应位置类型兼容。最终列名通常来自第一个 SELECT，因此第一段 SELECT 的别名要有意设计。', "SELECT city AS place FROM customers\nUNION\nSELECT location AS place FROM departments;", 'Do both SELECT statements return the same shape?', '两个 SELECT 是否返回相同形状？'),
      c('UNION vs UNION ALL', 'UNION 与 UNION ALL', 'UNION removes duplicates; UNION ALL keeps them.', 'UNION 去重，UNION ALL 保留重复。', 'Use UNION when the combined list should behave like a mathematical set. Use UNION ALL when duplicates are meaningful or when you know the inputs cannot overlap. UNION ALL is usually faster because it skips duplicate elimination.', '当合并列表应像数学集合时，用 UNION；当重复有意义或已知输入不会重叠时，用 UNION ALL。UNION ALL 通常更快，因为它跳过去重。', "SELECT name AS label FROM customers\nUNION ALL\nSELECT dept_name AS label FROM departments;", 'Are duplicates information or noise?', '重复值是信息，还是噪音？'),
      c('Final ORDER BY', '最终 ORDER BY', 'ORDER BY applies to the combined result.', 'ORDER BY 作用于合并后的最终结果。', 'In most SQL dialects, place ORDER BY after the last SELECT to sort the whole unioned output. Sorting individual branches does not guarantee final order unless paired with more advanced subqueries.', '多数 SQL 方言中，ORDER BY 放在最后一个 SELECT 后，用于排序整个合并结果。单独排序分支通常不保证最终顺序，除非使用更高级子查询。', "SELECT city AS place FROM customers\nUNION\nSELECT location AS place FROM departments\nORDER BY place;", 'Are you sorting one branch or the final combined answer?', '你排序的是某个分支，还是最终合并答案？'),
    ],
    pitfalls: { en: ['Column counts must match.', 'ORDER BY belongs at the end of the compound query.'], zh: ['列数必须匹配。', 'ORDER BY 属于复合查询末尾。'] },
    readingRefs: ['Pocket Guide UNION', 'Cookbook 4.7', 'Head First SQL Ch.14'],
  },
  {
    title: { en: 'Window Functions: ROW_NUMBER and RANK', zh: '窗口函数：ROW_NUMBER 与 RANK' },
    minutes: 44,
    objectives: {
      en: ['Explain how windows differ from GROUP BY', 'Use PARTITION BY and ORDER BY inside OVER', 'Compare ROW_NUMBER, RANK, and DENSE_RANK'],
      zh: ['解释窗口函数与 GROUP BY 的区别', '在 OVER 中使用 PARTITION BY 和 ORDER BY', '比较 ROW_NUMBER、RANK、DENSE_RANK'],
    },
    concepts: [
      c('Keep Rows, Add Context', '保留行，增加上下文', 'Window functions calculate across related rows without collapsing them.', '窗口函数跨相关行计算，但不压缩明细行。', 'GROUP BY returns one row per group. Window functions keep each employee row while adding information such as rank or department average. This makes them ideal for top-N per group and comparisons to peers.', 'GROUP BY 每组返回一行；窗口函数保留每个员工行，同时增加排名或部门平均等信息。因此它们很适合每组 Top-N 和同伴比较。', 'SELECT first_name, salary,\n       ROW_NUMBER() OVER (ORDER BY salary DESC) AS salary_rank\nFROM employees;', 'Do you need detail rows to remain visible?', '你是否需要保留明细行？'),
      c('PARTITION BY', 'PARTITION BY 分区', 'Partitioning restarts the calculation for each group.', '分区会让计算在每组内重新开始。', 'PARTITION BY dept_id ranks employees within each department. ORDER BY inside OVER controls ranking order; it is separate from the final output ORDER BY.', 'PARTITION BY dept_id 会在每个部门内给员工排名。OVER 内的 ORDER BY 控制排名顺序；它不同于最终输出排序。', 'SELECT first_name, dept_id, salary,\n       RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dept_rank\nFROM employees;', 'What group should the calculation restart for?', '计算应该在哪个组内重新开始？'),
      c('Ranking Choices', '排名选择', 'Tie handling changes the rank number.', '并列处理会改变排名数字。', 'ROW_NUMBER always produces unique sequence numbers. RANK gives tied rows the same rank and leaves gaps. DENSE_RANK gives tied rows the same rank without gaps. Choose based on how the report should treat ties.', 'ROW_NUMBER 总是产生唯一序号；RANK 给并列行相同名次并跳号；DENSE_RANK 给并列行相同名次但不跳号。根据报表如何处理并列来选择。', 'SELECT first_name, salary,\n       ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn,\n       RANK() OVER (ORDER BY salary DESC) AS rnk,\n       DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rnk\nFROM employees;', 'Should ties share a rank?', '并列值是否应该共享名次？'),
    ],
    pitfalls: { en: ['Window functions cannot be used directly in WHERE.', 'OVER ORDER BY is not the same as final ORDER BY.'], zh: ['窗口函数不能直接用于 WHERE。', 'OVER 内 ORDER BY 不等于最终 ORDER BY。'] },
    readingRefs: ['Cookbook 4.8', 'Practical SQL Ch.9', 'Pocket Guide Window'],
  },
  {
    title: { en: 'CTEs with WITH', zh: 'WITH 与 CTE 公用表表达式' },
    minutes: 40,
    objectives: {
      en: ['Define named temporary result sets', 'Break complex SQL into readable stages', 'Chain multiple CTEs'],
      zh: ['定义命名临时结果集', '把复杂 SQL 拆成可读阶段', '串联多个 CTE'],
    },
    concepts: [
      c('Name a Query Step', '给查询步骤命名', 'A CTE is a named subquery at the top of a statement.', 'CTE 是语句顶部的命名子查询。', 'WITH cte_name AS (...) lets you name an intermediate result. The main SELECT can then read from that name as if it were a temporary table. This improves readability and makes debugging easier.', 'WITH cte_name AS (...) 允许命名一个中间结果。主 SELECT 可以像读临时表一样读取该名称。这能提升可读性，也让调试更容易。', "WITH sf_depts AS (\n  SELECT dept_id FROM departments WHERE location = 'San Francisco'\n)\nSELECT e.first_name, e.salary\nFROM employees e\nWHERE e.dept_id IN (SELECT dept_id FROM sf_depts);", 'What intermediate idea deserves a name?', '哪个中间想法值得命名？'),
      c('Multiple CTEs', '多个 CTE', 'Later CTEs can refer to earlier CTEs.', '后面的 CTE 可以引用前面的 CTE。', 'Use multiple CTEs to build a pipeline: filter facts, aggregate them, then join or rank the summary. Keep each CTE focused enough that you can run it mentally or temporarily inspect it.', '可以用多个 CTE 搭建流水线：过滤事实、聚合、再 JOIN 或排名。每个 CTE 应足够聚焦，方便你心算或临时检查。', 'WITH dept_avg AS (\n  SELECT dept_id, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY dept_id\n)\nSELECT e.first_name, e.salary, d.avg_salary\nFROM employees e\nJOIN dept_avg d ON e.dept_id = d.dept_id\nWHERE e.salary > d.avg_salary;', 'Can each CTE be described in one sentence?', '每个 CTE 能否用一句话描述？'),
      c('CTE vs Subquery', 'CTE 与子查询', 'CTEs usually improve readability, not necessarily performance.', 'CTE 通常改善可读性，不一定改善性能。', 'A CTE and a derived table can be logically equivalent. Choose CTEs when naming the step helps the reader, especially in learning or analytical SQL. Do not assume a CTE is automatically materialized or faster.', 'CTE 和派生表可能逻辑等价。当命名步骤有助于读者理解时，尤其在学习或分析 SQL 中，选择 CTE。不要假设 CTE 自动物化或更快。', 'WITH completed_orders AS (\n  SELECT * FROM orders WHERE status = \'completed\'\n)\nSELECT customer_id, SUM(total_amount)\nFROM completed_orders\nGROUP BY customer_id;', 'Is the named step making the query easier to read?', '命名步骤是否让查询更易读？'),
    ],
    pitfalls: { en: ['CTE names must be unique within one WITH clause.', 'A CTE is scoped to the single statement.'], zh: ['同一个 WITH 中 CTE 名不能重复。', 'CTE 只在单条语句内有效。'] },
    readingRefs: ['Practical SQL Ch.9', 'Cookbook 4.9', 'Pocket Guide CTE'],
  },
  {
    title: { en: 'Indexes and CREATE INDEX', zh: '索引与 CREATE INDEX' },
    minutes: 36,
    objectives: {
      en: ['Explain what an index helps the database find', 'Create regular and unique indexes', 'Understand read/write trade-offs'],
      zh: ['解释索引帮助数据库寻找什么', '创建普通索引和唯一索引', '理解读写权衡'],
    },
    concepts: [
      c('Index as Lookup Structure', '索引是查找结构', 'Indexes help locate rows without scanning everything.', '索引帮助定位行，而不用扫描全部。', 'An index is like an ordered lookup structure for one or more columns. It is useful for columns often used in WHERE, JOIN ON, or ORDER BY. In this tiny database the speed difference is small, but the design principle is real.', '索引像针对一列或多列的有序查找结构。常用于 WHERE、JOIN ON、ORDER BY 的列通常适合索引。本小数据库速度差异不明显，但设计原则真实存在。', 'CREATE INDEX idx_employees_dept_id ON employees(dept_id);\nCREATE INDEX idx_orders_customer_id ON orders(customer_id);', 'Which repeated lookup should this index support?', '这个索引支持哪种重复查找？'),
      c('Unique Index', '唯一索引', 'A unique index enforces uniqueness and speeds lookup.', '唯一索引既强制唯一，也加速查找。', 'CREATE UNIQUE INDEX on employees.email would prevent duplicate email values. Use unique indexes for natural keys only when the business rule truly says duplicates are impossible.', '在 employees.email 上创建 UNIQUE INDEX 可防止重复 email。只有业务规则确实保证不可能重复时，才把自然键设为唯一。', 'CREATE UNIQUE INDEX idx_employees_email ON employees(email);', 'Is uniqueness a business rule or just a current accident?', '唯一性是业务规则，还是当前数据偶然如此？'),
      c('Trade-Offs', '权衡', 'Indexes speed reads but add write and storage cost.', '索引加速读取，但增加写入和存储成本。', 'Every INSERT, UPDATE, or DELETE may also update indexes. Too many indexes can slow writes and complicate planning. Index design should come from observed query patterns, not from indexing every column.', '每次 INSERT、UPDATE、DELETE 都可能同时维护索引。过多索引会拖慢写入并增加优化复杂度。索引设计应来自观察到的查询模式，而不是给每列都建索引。', 'EXPLAIN QUERY PLAN\nSELECT * FROM employees WHERE dept_id = 1;', 'What query pattern justifies the index?', '什么查询模式证明这个索引值得建？'),
    ],
    pitfalls: { en: ['Do not index every column by default.', 'Low-cardinality columns may not help much alone.'], zh: ['不要默认给每列建索引。', '低基数列单独建索引收益可能有限。'] },
    readingRefs: ['Practical SQL Ch.10', 'Pocket Guide Indexes', 'Cookbook 5.1'],
  },
  {
    title: { en: 'Views', zh: '视图 VIEW' },
    minutes: 34,
    objectives: {
      en: ['Create a view from a SELECT', 'Use views to simplify repeated joins', 'Distinguish views from stored tables'],
      zh: ['从 SELECT 创建视图', '用视图简化重复 JOIN', '区分视图与存储表'],
    },
    concepts: [
      c('Saved Query Definition', '保存的查询定义', 'A view stores SQL, not ordinary table data.', '视图保存 SQL，不是普通表数据。', 'CREATE VIEW gives a SELECT statement a name. Querying the view runs the underlying SELECT. This is useful when a join pattern is repeated often or when you want a stable report interface.', 'CREATE VIEW 给 SELECT 语句命名。查询视图会运行底层 SELECT。重复使用同一 JOIN 模式，或想提供稳定报表接口时，视图很有用。', 'CREATE VIEW v_employee_dept AS\nSELECT e.emp_id, e.first_name, e.last_name, d.dept_name, e.salary\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.dept_id;', 'What repeated query pattern should be named?', '哪种重复查询模式值得命名？'),
      c('Query a View', '查询视图', 'After creation, a view behaves like a table in SELECT.', '创建后，视图在 SELECT 中像表一样使用。', 'Consumers can filter, sort, and join a view. They do not need to know every underlying table relationship. This lowers friction, but view names and column names must be clear.', '使用者可以过滤、排序、JOIN 视图，不必知道底层所有表关系。这能降低学习和使用摩擦，但视图名和列名必须清楚。', 'SELECT *\nFROM v_employee_dept\nWHERE salary > 80000;', 'Does the view hide useful complexity or important detail?', '视图隐藏的是有用复杂性，还是重要细节？'),
      c('View Limitations', '视图限制', 'Views are not automatic performance magic.', '视图不会自动带来性能魔法。', 'A standard view usually re-runs its definition. Some databases support materialized views, but that is a different object. SQLite views can be limited for updates, so treat them mainly as readable query abstractions here.', '标准视图通常会重新运行其定义。有些数据库支持物化视图，但那是不同对象。SQLite 视图在更新方面有限，本课程主要把它当作可读查询抽象。', 'DROP VIEW IF EXISTS v_employee_dept;', 'Are you using the view for readability, security, or performance?', '你使用视图是为了可读性、权限，还是性能？'),
    ],
    pitfalls: { en: ['A normal view does not store a fresh copy of data.', 'Changing a view definition can break consumers.'], zh: ['普通视图不存储一份新数据。', '修改视图定义可能破坏使用者。'] },
    readingRefs: ['Cookbook 5.2', 'Practical SQL Ch.10', 'Pocket Guide Views'],
  },
  {
    title: { en: 'Transactions', zh: '事务 TRANSACTION' },
    minutes: 38,
    objectives: {
      en: ['Explain atomicity with BEGIN, COMMIT, and ROLLBACK', 'Group related writes into one unit', 'Understand SQLite autocommit'],
      zh: ['用 BEGIN、COMMIT、ROLLBACK 解释原子性', '把相关写入组成一个单元', '理解 SQLite 自动提交'],
    },
    concepts: [
      c('All or Nothing', '要么全成，要么全撤', 'A transaction groups statements into one unit of work.', '事务把多条语句组成一个工作单元。', 'If an order reduces product stock and inserts order_items, those writes should succeed together or fail together. BEGIN starts the unit, COMMIT makes it permanent, and ROLLBACK cancels it.', '如果一张订单既减少库存又插入 order_items，这些写入应一起成功或一起失败。BEGIN 开始工作单元，COMMIT 使其永久生效，ROLLBACK 撤销。', 'BEGIN;\nUPDATE products SET stock_qty = stock_qty - 1 WHERE product_id = 1;\nINSERT INTO order_items (item_id, order_id, product_id, quantity, unit_price)\nVALUES (99, 101, 1, 1, 1299.99);\nCOMMIT;', 'What statements must succeed as a set?', '哪些语句必须作为整体成功？'),
      c('ROLLBACK for Safety', 'ROLLBACK 保安全', 'Rollback returns the database to the transaction start.', 'ROLLBACK 让数据库回到事务开始前。', 'Use transactions while practicing destructive statements: BEGIN, try the UPDATE or DELETE, inspect the result, then ROLLBACK if you are only experimenting. This is a practical safety loop.', '练习破坏性语句时可使用事务：BEGIN，尝试 UPDATE 或 DELETE，检查结果，如果只是实验就 ROLLBACK。这是实用的安全循环。', 'BEGIN;\nDELETE FROM order_items WHERE item_id = 99;\nROLLBACK;', 'Is this experiment supposed to persist?', '这个实验结果是否应该保留？'),
      c('Autocommit', '自动提交', 'SQLite commits individual statements by default.', 'SQLite 默认逐条语句自动提交。', 'Without an explicit transaction, each statement is its own transaction. That is convenient, but related writes can be left half-done if an error happens between statements. Explicit transactions make your intended unit visible.', '没有显式事务时，每条语句都是自己的事务。这很方便，但多条相关写入中途出错时可能留下半成状态。显式事务让工作单元变得可见。', 'BEGIN;\n-- related statements here\nCOMMIT;', 'Where does the business operation begin and end?', '业务操作从哪里开始，到哪里结束？'),
    ],
    pitfalls: { en: ['Long transactions can hold locks.', 'Do not forget COMMIT when changes should persist.'], zh: ['长事务可能持有锁。', '需要保留修改时不要忘记 COMMIT。'] },
    readingRefs: ['Practical SQL Ch.11', 'Head First SQL Ch.15', 'Pocket Guide Transactions'],
  },
  {
    title: { en: 'Import, Export, and Reproducible Scripts', zh: '导入、导出与可复现脚本' },
    minutes: 32,
    objectives: {
      en: ['Understand CSV import workflow', 'Export query-shaped results', 'Value reproducible SQL scripts'],
      zh: ['理解 CSV 导入流程', '导出查询形状的结果', '重视可复现 SQL 脚本'],
    },
    concepts: [
      c('Import Workflow', '导入流程', 'Import starts before the command: inspect the file first.', '导入在命令前就开始：先检查文件。', 'Before importing CSV, inspect headers, delimiter, date formats, encodings, and missing-value markers. Create a table that matches the data, then import, then validate row counts and sample rows.', '导入 CSV 前，先检查表头、分隔符、日期格式、编码、缺失值标记。创建匹配数据的表，再导入，并验证行数和样本行。', '-- SQLite CLI concept:\n-- .mode csv\n-- .import products.csv products', 'What assumptions about the file need validation?', '关于文件的哪些假设需要验证？'),
      c('Export Query Results', '导出查询结果', 'Export the answer, not necessarily the raw table.', '导出答案，不一定导出原始表。', 'Often the useful export is a SELECT result with clean columns, aliases, filters, and sort order. Treat export as the final step of a reproducible analysis, not a manual copy-paste.', '有用的导出通常是带清晰列、别名、过滤和排序的 SELECT 结果。把导出看成可复现分析的最后一步，而不是手动复制粘贴。', '-- SQLite CLI concept:\n-- .headers on\n-- .mode csv\n-- .output revenue.csv\n-- SELECT customer_id, SUM(total_amount) AS revenue FROM orders GROUP BY customer_id;', 'Can you recreate the exported file from SQL alone?', '你能仅靠 SQL 重建导出文件吗？'),
      c('Scripts Tell a Story', '脚本讲述过程', 'A script records setup, cleaning, and analysis in order.', '脚本按顺序记录建表、清洗和分析。', 'A good SQL script is readable from top to bottom: create structures, load data, clean or validate, then query. Comments should explain why a step exists, not merely repeat the syntax.', '好的 SQL 脚本可以从上到下阅读：建结构、载入数据、清洗或验证、再查询。注释应解释步骤存在的原因，而不是重复语法。', '-- 1. create staging table\n-- 2. import raw CSV\n-- 3. validate row counts\n-- 4. transform into final tables', 'Could someone else rerun your workflow tomorrow?', '别人明天能否重跑你的流程？'),
    ],
    pitfalls: { en: ['CSV quoting rules matter when fields contain commas or newlines.', 'Import parent tables before child tables when foreign keys exist.'], zh: ['字段含逗号或换行时，CSV 引号规则很重要。', '有外键时先导入父表，再导入子表。'] },
    readingRefs: ['Practical SQL Ch.12', 'Cookbook 1.3', 'Pocket Guide CLI'],
  },
  {
    title: { en: 'Integrated Review Project', zh: '综合复习项目' },
    minutes: 48,
    objectives: {
      en: ['Build multi-table reports step by step', 'Combine joins, filters, groups, and subqueries', 'Diagnose weak spots before the final exam'],
      zh: ['逐步构建多表报表', '组合 JOIN、过滤、分组和子查询', '期末前诊断薄弱点'],
    },
    concepts: [
      c('Customer Order Analysis', '客户订单分析', 'Start from the business question and decide the result grain.', '从业务问题出发，先决定结果粒度。', 'For revenue per customer, the grain is one row per customer. Use customers as the preserved dimension, left join completed orders, then group by customer id and name. This keeps customers with no completed orders visible.', '按客户统计收入时，结果粒度是一行一个客户。以 customers 作为保留维度，LEFT JOIN completed orders，再按 customer_id 和 name 分组。这样没有 completed 订单的客户也可见。', "SELECT c.name,\n       COUNT(o.order_id) AS completed_orders,\n       COALESCE(SUM(o.total_amount), 0) AS completed_revenue\nFROM customers c\nLEFT JOIN orders o\n  ON c.customer_id = o.customer_id\n AND o.status = 'completed'\nGROUP BY c.customer_id, c.name;", 'What grain should the final report have?', '最终报表应该是什么粒度？'),
      c('Department Workforce Analysis', '部门人力分析', 'Use joins for labels and CTEs for reusable summaries.', '用 JOIN 取标签，用 CTE 复用汇总。', 'A department workforce report may need headcount, average salary, and employees above their department average. Build the department average first, then join employees back to the summary.', '部门人力报表可能需要人数、平均工资、以及高于本部门平均的员工。先构建部门平均，再把 employees 连接回汇总结果。', 'WITH dept_avg AS (\n  SELECT dept_id, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY dept_id\n)\nSELECT e.first_name, e.salary, d.avg_salary\nFROM employees e\nJOIN dept_avg d ON e.dept_id = d.dept_id\nWHERE e.salary > d.avg_salary;', 'Which intermediate result makes the final query simpler?', '哪个中间结果能让最终查询更简单？'),
      c('Debugging Checklist', '调试清单', 'Complex SQL becomes manageable when checked in layers.', '分层检查后，复杂 SQL 会变得可控。', 'Run each stage: base table count, joined row count, filtered rows, grouped output, final ordering. If an answer is wrong, remove the last clause and verify the previous layer. This turns SQL debugging into a repeatable process.', '逐层运行：基础表行数、JOIN 后行数、过滤行、分组输出、最终排序。如果答案错误，去掉最后一个子句检查上一层。这能把 SQL 调试变成可重复流程。', 'SELECT COUNT(*) FROM order_items;\n-- add joins\n-- add filters\n-- add GROUP BY\n-- add HAVING / ORDER BY', 'Which layer first produced an unexpected result?', '哪一层最先产生异常结果？'),
    ],
    pitfalls: { en: ['Do not write a full complex query all at once.', 'Check grain before and after every join.'], zh: ['不要一次性写完整复杂查询。', '每次 JOIN 前后都检查粒度。'] },
    readingRefs: ['Practical SQL review', 'Cookbook review', 'Head First SQL review'],
  },
  {
    title: { en: 'Final Review and Exam Strategy', zh: '期末复习与应试策略' },
    minutes: 45,
    objectives: {
      en: ['Review the 30-day knowledge map', 'Use a repeatable SQL problem-solving sequence', 'Turn wrong answers into targeted review'],
      zh: ['回顾 30 天知识地图', '使用可重复的 SQL 解题顺序', '把错题转化为定向复习'],
    },
    concepts: [
      c('Knowledge Map', '知识地图', 'SQL skills build from rows to relationships to summaries.', 'SQL 技能从行、关系，再到汇总逐层建立。', 'Days 1-6 build single-table reading. Days 7-10 add data definition and relationships. Days 11-14 focus on joins and subqueries. Days 15-24 add aggregation, expressions, strings, dates, set operations, windows, and CTEs. Days 25-28 cover operational concepts.', '第 1-6 天建立单表读取能力；第 7-10 天加入数据定义和关系；第 11-14 天聚焦 JOIN 与子查询；第 15-24 天加入聚合、表达式、字符串、日期、集合运算、窗口函数和 CTE；第 25-28 天覆盖操作性概念。', 'SELECT topic FROM your_memory\nORDER BY confidence ASC;', 'Which topic feels slow rather than impossible?', '哪个主题不是不会，而是做得慢？'),
      c('Problem-Solving Sequence', '解题顺序', 'Read the question as an output specification.', '把题目读成输出规格。', 'For SQL exercises, identify output columns, result grain, source tables, join path, row filters, grouping, group filters, and ordering. This order prevents jumping straight to syntax before understanding the answer shape.', '做 SQL 题时，依次识别输出列、结果粒度、来源表、JOIN 路径、行过滤、分组、组过滤和排序。这个顺序能避免在理解答案形状前就急着写语法。', '-- Output columns -> grain -> tables -> joins -> WHERE -> GROUP BY -> HAVING -> ORDER BY', 'What is the answer supposed to look like?', '答案应该长什么样？'),
      c('Review from Mistakes', '从错题复习', 'Wrong answers reveal which mental model needs repair.', '错题揭示哪个心智模型需要修复。', 'Classify mistakes: syntax typo, wrong table, wrong grain, missing join, wrong filter timing, NULL behavior, or aggregate misunderstanding. Then return to the concept block for that category before retrying the exercise.', '给错误分类：语法拼写、选错表、粒度错误、漏 JOIN、过滤时机错误、NULL 行为、聚合理解错误。然后回到对应概念块复习，再重做题。', 'SELECT mistake_type, COUNT(*)\nFROM wrong_book\nGROUP BY mistake_type;', 'What category does this mistake belong to?', '这个错误属于哪一类？'),
    ],
    pitfalls: { en: ['Do not skip ORDER BY when the question requests ranking.', 'Do not treat memorized syntax as understanding; explain the grain.'], zh: ['题目要求排名时不要漏 ORDER BY。', '不要把记住语法当成理解；要能解释粒度。'] },
    readingRefs: ['Pocket Guide review', 'Practical SQL appendix', 'SQL Cookbook patterns'],
  },
];

export const LESSONS = Object.fromEntries(
  TOPIC_DAYS.map((lesson, index) => [
    index + 1,
    {
      ...lesson,
      summary: {
        en: `Today turns ${lesson.title.en.toLowerCase()} into practical habits using the local business schema. Read the concept map first, expand only the sections you need, then test the idea in the exercises.`,
        zh: `今天把“${lesson.title.zh}”转化为可操作习惯，并全部围绕本地业务 schema 展开。先看概念地图，只展开需要复习的概念，再用练习验证理解。`,
      },
    },
  ])
);

function c(titleEn, titleZh, summaryEn, summaryZh, explanationEn, explanationZh, code, checkEn, checkZh) {
  return {
    title: { en: titleEn, zh: titleZh },
    summary: { en: summaryEn, zh: summaryZh },
    explanation: { en: explanationEn, zh: explanationZh },
    code,
    checkYourself: { en: checkEn, zh: checkZh },
  };
}
