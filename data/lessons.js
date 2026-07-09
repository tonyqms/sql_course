/**
 * 30-day SQL learning curriculum — original content inspired by common teaching patterns.
 * Schema: departments, employees, customers, products, orders, order_items
 */

export const LESSONS = {
  1: {
    title: 'SQL 入门：数据库与 SELECT 全表查询',
    minutes: 30,
    objectives: [
      '理解关系型数据库、表、行、列的基本概念',
      '掌握 SELECT * 查询整张表',
      '熟悉本课程练习库中的六张核心表',
    ],
    concepts: [
      {
        title: '什么是 SQL 与关系型数据库',
        body: 'SQL（Structured Query Language）是用于管理关系型数据库的标准语言。数据以**表（table）**形式存储：每行是一条记录，每列是一个字段。本课程使用 SQLite 语法，表包括 departments、employees、customers、products、orders、order_items。',
      },
      {
        title: 'SELECT 基础语法',
        body: 'SELECT 用于从表中读取数据。最简形式：`SELECT * FROM 表名;`，星号表示返回所有列。分号表示语句结束（好习惯）。',
        code: 'SELECT * FROM employees;',
      },
      {
        title: '探索 schema',
        body: 'employees 表含 emp_id、first_name、last_name、email、dept_id、salary、hire_date、manager_id。先 `SELECT * FROM employees` 观察 10 行员工数据，再分别查看 departments、customers、products、orders、order_items。',
        code: 'SELECT * FROM departments;\nSELECT * FROM customers;\nSELECT * FROM products;',
      },
    ],
    pitfalls: [
      'SELECT 后忘记写 FROM 会导致语法错误',
      '表名拼写错误（SQLite 默认大小写不敏感，但建议与 schema 一致）',
    ],
    readingRefs: ['Practical SQL Ch.1-2', 'Head First SQL Ch.1', 'Pocket Guide SELECT'],
  },

  2: {
    title: '选择列与 DISTINCT 去重',
    minutes: 28,
    objectives: [
      '只查询需要的列，避免 SELECT * 滥用',
      '使用 DISTINCT 去除重复值',
      '理解列别名 AS 的用法',
    ],
    concepts: [
      {
        title: '指定列',
        body: '在 SELECT 后列出列名，逗号分隔。只取需要的列可提升可读性并减少数据传输。',
        code: 'SELECT first_name, last_name, salary FROM employees;',
      },
      {
        title: '列别名 AS',
        body: 'AS 给列或表达式起别名，结果集列名更易读。AS 可省略，但建议保留以提高清晰度。',
        code: 'SELECT first_name AS 名, last_name AS 姓 FROM employees;',
      },
      {
        title: 'DISTINCT 去重',
        body: 'DISTINCT 对选定列的组合去重，常用于查看有哪些不同的城市、类别、部门等。',
        code: 'SELECT DISTINCT city FROM customers;\nSELECT DISTINCT category FROM products;',
      },
    ],
    pitfalls: [
      'DISTINCT 作用于 SELECT 后所有列的组合，而非单列',
      'SELECT dept_id, DISTINCT dept_name 语法非法，DISTINCT 必须紧跟 SELECT',
    ],
    readingRefs: ['Practical SQL Ch.2', 'Pocket Guide SELECT', 'Cookbook 1.1'],
  },

  3: {
    title: 'WHERE 条件过滤与 AND/OR',
    minutes: 32,
    objectives: [
      '使用 WHERE 子句筛选行',
      '组合 AND、OR 与括号控制优先级',
      '使用比较运算符 = <> < > <= >=',
    ],
    concepts: [
      {
        title: 'WHERE 基础',
        body: 'WHERE 在 FROM 之后，只返回满足条件的行。字符串用单引号包裹。',
        code: "SELECT * FROM employees WHERE salary > 80000;\nSELECT * FROM customers WHERE country = 'USA';",
      },
      {
        title: 'AND 与 OR',
        body: 'AND 要求同时满足；OR 满足其一即可。复杂条件用括号分组，避免逻辑歧义。',
        code: "SELECT * FROM employees WHERE dept_id = 1 AND salary >= 90000;\nSELECT * FROM products WHERE category = 'Electronics' OR unit_price < 50;",
      },
      {
        title: 'BETWEEN 与 IN',
        body: 'BETWEEN 表示范围（含边界）；IN 表示在列表中。二者可简化多个 OR/AND。',
        code: 'SELECT * FROM employees WHERE salary BETWEEN 70000 AND 90000;\nSELECT * FROM orders WHERE status IN (\'completed\', \'shipped\');',
      },
    ],
    pitfalls: [
      'OR 与 AND 混用时忘记括号，导致结果出乎意料',
      '字符串比较区分大小写取决于数据库排序规则；本课程数据为固定大小写',
    ],
    readingRefs: ['Head First SQL Ch.2', 'Pocket Guide WHERE', 'Cookbook 2.1'],
  },

  4: {
    title: 'ORDER BY 排序与 LIMIT 限制行数',
    minutes: 28,
    objectives: [
      '使用 ORDER BY 按一列或多列排序',
      'ASC 升序与 DESC 降序',
      'LIMIT 取前 N 行（Top-N 查询）',
    ],
    concepts: [
      {
        title: 'ORDER BY',
        body: 'ORDER BY 放在 WHERE 之后（无 WHERE 则紧跟 FROM）。默认 ASC 升序；DESC 降序。',
        code: 'SELECT first_name, salary FROM employees ORDER BY salary DESC;',
      },
      {
        title: '多列排序',
        body: '先按第一列排序，相同值再按第二列。常用于「部门内按工资排序」。',
        code: 'SELECT * FROM employees ORDER BY dept_id ASC, salary DESC;',
      },
      {
        title: 'LIMIT',
        body: 'SQLite 用 LIMIT n 取前 n 行，常与 ORDER BY 配合做 Top-N。',
        code: 'SELECT first_name, salary FROM employees ORDER BY salary DESC LIMIT 3;',
      },
    ],
    pitfalls: [
      '没有 ORDER BY 时结果顺序不确定，不要依赖默认顺序',
      'LIMIT 在 SQLite 中写在语句末尾；其他数据库可能用 FETCH FIRST',
    ],
    readingRefs: ['Practical SQL Ch.2', 'Pocket Guide ORDER BY', 'Cookbook 1.4'],
  },

  5: {
    title: 'LIKE 模糊匹配、NULL 与 COALESCE',
    minutes: 35,
    objectives: [
      '使用 LIKE 与通配符 % _ 做模式匹配',
      '理解 NULL 含义及 IS NULL / IS NOT NULL',
      '用 COALESCE 处理空值',
    ],
    concepts: [
      {
        title: 'LIKE 模式匹配',
        body: '% 匹配任意长度字符；_ 匹配单个字符。LIKE 通常不区分大小写（取决于数据库）。',
        code: "SELECT * FROM employees WHERE last_name LIKE 'S%';\nSELECT * FROM products WHERE product_name LIKE '%Desk%';",
      },
      {
        title: 'NULL 的特殊性',
        body: 'NULL 表示缺失/未知，不等于空字符串。比较 NULL 用 IS NULL，不能用 = NULL。',
        code: 'SELECT * FROM employees WHERE salary IS NULL;\nSELECT * FROM employees WHERE manager_id IS NOT NULL;',
      },
      {
        title: 'COALESCE',
        body: 'COALESCE(v1, v2, ...) 返回第一个非 NULL 值，常用于显示默认值。',
        code: "SELECT first_name, COALESCE(salary, 0) AS salary FROM employees;",
      },
    ],
    pitfalls: [
      'WHERE salary = NULL 永远为 unknown，不会匹配任何行',
      'LIKE 中 % 和 _ 是通配符，若匹配字面量需转义',
    ],
    readingRefs: ['Head First SQL Ch.3', 'Cookbook 2.5', 'Pocket Guide NULL', 'Practical SQL Ch.3'],
  },

  6: {
    title: '数据类型与 CAST 类型转换',
    minutes: 30,
    objectives: [
      '认识 SQLite 常用类型：INTEGER、REAL、TEXT',
      '使用 CAST 在类型间转换',
      '理解隐式转换与显式转换的区别',
    ],
    concepts: [
      {
        title: 'SQLite 类型亲和性',
        body: 'SQLite 使用动态类型：INTEGER、REAL、TEXT、BLOB、NULL。本 schema 中 salary、unit_price 为 REAL，日期存为 TEXT（ISO 格式 YYYY-MM-DD）。',
      },
      {
        title: 'CAST 显式转换',
        body: 'CAST(表达式 AS 类型) 将值转为目标类型，常用于计算或格式化输出。',
        code: 'SELECT product_name, CAST(unit_price AS INTEGER) AS price_int FROM products;\nSELECT CAST(\'2024-01-15\' AS TEXT);',
      },
      {
        title: '类型与计算',
        body: '数值列可直接算术运算；TEXT 日期在 SQLite 中可按字符串比较（ISO 格式下等价于日期顺序）。',
        code: 'SELECT quantity * unit_price AS line_total FROM order_items;',
      },
    ],
    pitfalls: [
      '对非数字字符串 CAST 为 INTEGER 可能得到 0 或报错',
      '日期存 TEXT 时需统一格式，否则字符串排序会出错',
    ],
    readingRefs: ['Practical SQL Ch.4', 'Pocket Guide Data Types', 'Cookbook 2.8'],
  },

  7: {
    title: 'INSERT、UPDATE、DELETE 数据操纵',
    minutes: 38,
    objectives: [
      'INSERT 插入新行',
      'UPDATE 修改已有行（务必带 WHERE）',
      'DELETE 删除行',
    ],
    concepts: [
      {
        title: 'INSERT',
        body: '指定列和值插入一行或多行。主键若 AUTOINCREMENT 可省略；本练习库主键需手动指定或使用现有最大值+1。',
        code: "INSERT INTO customers (customer_id, name, city, country) VALUES (6, 'Wayne Enterprises', 'Gotham', 'USA');",
      },
      {
        title: 'UPDATE',
        body: 'SET 列=新值。**生产环境 UPDATE 必须带 WHERE**，否则会更新全表。',
        code: "UPDATE products SET unit_price = 34.99 WHERE product_id = 2;",
      },
      {
        title: 'DELETE',
        body: 'DELETE FROM 表 WHERE 条件。无 WHERE 将删除全表数据（表结构保留）。',
        code: "DELETE FROM orders WHERE status = 'cancelled' AND order_id = 107;",
      },
    ],
    pitfalls: [
      'UPDATE/DELETE 忘记 WHERE 是常见灾难性错误',
      '插入时违反 FOREIGN KEY 或 NOT NULL 约束会失败',
    ],
    readingRefs: ['Head First SQL Ch.4', 'Practical SQL Ch.5', 'Cookbook 1.2', 'Pocket Guide DML'],
  },

  8: {
    title: 'CREATE TABLE 创建表',
    minutes: 35,
    objectives: [
      '使用 CREATE TABLE 定义表结构',
      '理解列定义：类型、NOT NULL、DEFAULT',
      'DROP TABLE 与 IF NOT EXISTS',
    ],
    concepts: [
      {
        title: 'CREATE TABLE 语法',
        body: '列名 类型 [约束,...]。SQLite 支持 IF NOT EXISTS 避免重复创建报错。',
        code: "CREATE TABLE IF NOT EXISTS suppliers (\n  supplier_id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  contact_email TEXT\n);",
      },
      {
        title: '约束预览',
        body: 'NOT NULL 禁止空值；DEFAULT 指定默认值；PRIMARY KEY 标识唯一行。下一课详讲外键。',
      },
      {
        title: 'DROP TABLE',
        body: 'DROP TABLE 表名 删除整张表及数据。练习时可 CREATE → INSERT → SELECT 验证。',
        code: 'DROP TABLE IF EXISTS suppliers;',
      },
    ],
    pitfalls: [
      'CREATE TABLE 列类型写错不会阻止插入错误类型（SQLite 弱类型）',
      'DROP TABLE 不可恢复，生产环境慎用',
    ],
    readingRefs: ['Practical SQL Ch.5', 'Head First SQL Ch.5', 'Pocket Guide DDL'],
  },

  9: {
    title: '主键与外键约束',
    minutes: 32,
    objectives: [
      'PRIMARY KEY 保证行唯一标识',
      'FOREIGN KEY 建立表间引用关系',
      '理解参照完整性',
    ],
    concepts: [
      {
        title: '主键 PRIMARY KEY',
        body: '每表应有主键唯一标识行。employees.emp_id、orders.order_id 等即主键。复合主键用 PRIMARY KEY (col1, col2)。',
      },
      {
        title: '外键 FOREIGN KEY',
        body: '外键列引用另一表主键。employees.dept_id → departments.dept_id；orders.customer_id → customers.customer_id。',
        code: 'SELECT e.first_name, d.dept_name\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id;',
      },
      {
        title: '参照完整性',
        body: '插入外键值时，被引用行必须存在；删除被引用行可能受限（取决于 ON DELETE 策略）。本课程 SQLite 需 PRAGMA foreign_keys=ON 才强制外键。',
      },
    ],
    pitfalls: [
      '外键列命名不统一（dept_id vs department_id）会增加 JOIN 心智负担',
      'SQLite 默认可能未开启外键检查',
    ],
    readingRefs: ['Practical SQL Ch.5', 'Head First SQL Ch.5', 'Cookbook 3.1'],
  },

  10: {
    title: '多表关系概念：一对多、JOIN 预备',
    minutes: 30,
    objectives: [
      '理解表之间的一对多关系',
      '认识 JOIN 的必要性',
      '用子查询或手动关联理解 dept_id 含义',
    ],
    concepts: [
      {
        title: '一对多关系',
        body: '一个部门有多名员工（departments 1→N employees）；一个客户有多张订单；一张订单有多条 order_items。外键在「多」的一侧。',
      },
      {
        title: '为什么需要 JOIN',
        body: '员工表只有 dept_id 数字，要显示部门名称必须关联 departments 表。关系型数据库规范化存储，查询时再组合。',
      },
      {
        title: '手动关联思路',
        body: '先查 employees.dept_id=1 的员工，再查 departments.dept_id=1 的名称。JOIN 将两步合并为一条 SQL。',
        code: 'SELECT emp_id, first_name, dept_id FROM employees WHERE dept_id = 1;\nSELECT dept_name FROM departments WHERE dept_id = 1;',
      },
    ],
    pitfalls: [
      '在单表中重复存储 dept_name 会导致更新异常（反范式）',
      '混淆主键与外键：外键在子表，指向父表主键',
    ],
    readingRefs: ['Head First SQL Ch.6', 'Practical SQL Ch.6', 'Cookbook 3.2'],
  },

  11: {
    title: 'INNER JOIN 内连接',
    minutes: 35,
    objectives: [
      '编写 INNER JOIN 关联两表',
      '使用表别名简化 SQL',
      '理解 INNER JOIN 只返回匹配行',
    ],
    concepts: [
      {
        title: 'INNER JOIN 语法',
        body: 'FROM 表1 INNER JOIN 表2 ON 表1.外键 = 表2.主键。匹配成功的行才出现在结果中。',
        code: 'SELECT e.first_name, e.last_name, d.dept_name\nFROM employees e\nINNER JOIN departments d ON e.dept_id = d.dept_id;',
      },
      {
        title: '表别名',
        body: 'e、d 等别名缩短列引用，避免歧义。SELECT、WHERE、ORDER BY 均可使用别名。',
      },
      {
        title: '多条件 ON',
        body: 'ON 后可加 AND 附加条件，但更常见的过滤应放在 WHERE。',
        code: 'SELECT c.name, o.order_id, o.total_amount\nFROM orders o\nINNER JOIN customers c ON o.customer_id = c.customer_id\nWHERE o.status = \'completed\';',
      },
    ],
    pitfalls: [
      '忘记 ON 条件导致笛卡尔积（行数暴增）',
      'INNER JOIN 会丢弃外键为 NULL 或无法匹配的行',
    ],
    readingRefs: ['Head First SQL Ch.7', 'Cookbook 3.3', 'Pocket Guide JOIN'],
  },

  12: {
    title: 'LEFT JOIN 左外连接',
    minutes: 32,
    objectives: [
      'LEFT JOIN 保留左表全部行',
      '找出无匹配的行（WHERE 右表.key IS NULL）',
      '对比 INNER JOIN 与 LEFT JOIN 结果差异',
    ],
    concepts: [
      {
        title: 'LEFT JOIN',
        body: '保留左表每一行；右表无匹配时右表列为 NULL。',
        code: 'SELECT e.first_name, d.dept_name\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.dept_id;',
      },
      {
        title: '找「没有」的关系',
        body: '「没有部门的员工」在 INNER JOIN 中消失；LEFT JOIN + IS NULL 可找出。',
        code: 'SELECT e.first_name\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.dept_id\nWHERE d.dept_id IS NULL;',
      },
      {
        title: 'RIGHT JOIN',
        body: 'SQLite 不支持 RIGHT JOIN，可用 LEFT JOIN 交换表顺序等价实现。',
      },
    ],
    pitfalls: [
      'LEFT JOIN 后在 WHERE 过滤右表列可能意外变成 INNER JOIN 效果',
      '把过滤条件放 ON 还是 WHERE 会影响 LEFT JOIN 保留行数',
    ],
    readingRefs: ['Cookbook 3.4', 'Head First SQL Ch.8', 'Practical SQL Ch.6'],
  },

  13: {
    title: '自连接与多表连接',
    minutes: 38,
    objectives: [
      '自连接查询员工与经理关系',
      '链式 JOIN 三表及以上',
      'orders → customers、order_items → products 典型路径',
    ],
    concepts: [
      {
        title: '自连接',
        body: '同一张表取两个别名，一个当员工一个当经理，通过 manager_id = emp_id 关联。',
        code: 'SELECT e.first_name AS employee, m.first_name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.emp_id;',
      },
      {
        title: '三表 JOIN',
        body: '订单明细需连 orders、customers、products 等。逐个 INNER JOIN 扩展。',
        code: 'SELECT c.name, o.order_date, p.product_name, oi.quantity\nFROM order_items oi\nJOIN orders o ON oi.order_id = o.order_id\nJOIN customers c ON o.customer_id = c.customer_id\nJOIN products p ON oi.product_id = p.product_id;',
      },
      {
        title: 'JOIN 顺序',
        body: 'SQLite 优化器通常自动选择顺序；写 SQL 时按业务逻辑从事实表（order_items）或驱动表出发即可。',
      },
    ],
    pitfalls: [
      '自连接忘记给表不同别名',
      '多表 JOIN 缺少条件产生笛卡尔积',
    ],
    readingRefs: ['Cookbook 3.5', 'Head First SQL Ch.9', 'Pocket Guide JOIN'],
  },

  14: {
    title: '子查询（Subquery）',
    minutes: 35,
    objectives: [
      '在 WHERE 中使用子查询',
      '标量子查询返回单值',
      'IN / EXISTS 与子查询配合',
    ],
    concepts: [
      {
        title: 'WHERE 中的子查询',
        body: '子查询用括号包裹，先内后外执行。常用于「比某平均值高」等动态条件。',
        code: 'SELECT first_name, salary FROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);',
      },
      {
        title: 'IN 子查询',
        body: '子查询返回一列多行，外层 IN 匹配。',
        code: "SELECT * FROM employees\nWHERE dept_id IN (SELECT dept_id FROM departments WHERE location = 'San Francisco');",
      },
      {
        title: 'FROM 子查询（派生表）',
        body: '子查询可作临时表，必须起别名。',
        code: 'SELECT dept_id, avg_sal FROM (\n  SELECT dept_id, AVG(salary) AS avg_sal FROM employees GROUP BY dept_id\n) t WHERE avg_sal > 75000;',
      },
    ],
    pitfalls: [
      '标量子查询返回多行会报错',
      '相关子查询性能较差，大数据量时考虑 JOIN',
    ],
    readingRefs: ['Cookbook 4.1', 'Head First SQL Ch.10', 'Pocket Guide Subqueries'],
  },

  15: {
    title: 'GROUP BY 分组入门（期中考试日）',
    minutes: 40,
    objectives: [
      '按列分组 GROUP BY',
      '理解分组后 SELECT 只能含分组列或聚合函数',
      'COUNT(*) 统计每组行数',
    ],
    concepts: [
      {
        title: 'GROUP BY 基础',
        body: '将相同 dept_id 的行归为一组，每组产生一行结果。常与 COUNT、SUM 等聚合函数一起用。',
        code: 'SELECT dept_id, COUNT(*) AS headcount FROM employees GROUP BY dept_id;',
      },
      {
        title: 'SELECT 列限制',
        body: 'SELECT 中出现的非聚合列必须出现在 GROUP BY 中，否则语义不明确（SQLite 较宽松，但应遵守 SQL 标准）。',
      },
      {
        title: '多列分组',
        body: 'GROUP BY col1, col2 按组合分组，如按国家+城市统计客户。',
        code: 'SELECT country, city, COUNT(*) FROM customers GROUP BY country, city;',
      },
    ],
    pitfalls: [
      'SELECT dept_name 但未 JOIN departments 且未 GROUP BY dept_name',
      'GROUP BY 与 WHERE 顺序：WHERE 先过滤行，再 GROUP BY',
    ],
    readingRefs: ['Head First SQL Ch.11', 'Cookbook 4.2', 'Practical SQL Ch.7'],
  },

  16: {
    title: 'GROUP BY 进阶与多表分组',
    minutes: 35,
    objectives: [
      'JOIN 后再 GROUP BY',
      '按部门名而非 dept_id 分组',
      '理解分组粒度',
    ],
    concepts: [
      {
        title: 'JOIN + GROUP BY',
        body: '先关联再分组，按维度列（如 dept_name）统计。',
        code: 'SELECT d.dept_name, COUNT(e.emp_id) AS n\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nGROUP BY d.dept_name;',
      },
      {
        title: '分组粒度选择',
        body: '按 product_id 分组 vs 按 category 分组答案不同。明确业务问题再选 GROUP BY 列。',
        code: 'SELECT category, COUNT(*) FROM products GROUP BY category;',
      },
      {
        title: 'NULL 与分组',
        body: 'GROUP BY 时 NULL 视为同一组。Jack 的 salary 为 NULL 仍计入 COUNT(*)。',
      },
    ],
    pitfalls: [
      'GROUP BY 别名：SQLite 允许 GROUP BY SELECT 别名，但移植性差',
      '重复 dept_name 时分组仍有效（按值分组非按 id）',
    ],
    readingRefs: ['Cookbook 4.3', 'Pocket Guide GROUP BY'],
  },

  17: {
    title: 'HAVING 过滤分组结果',
    minutes: 32,
    objectives: [
      'HAVING 与 WHERE 的区别',
      '对聚合结果设条件',
      'HAVING 中使用 COUNT、SUM 等',
    ],
    concepts: [
      {
        title: 'HAVING vs WHERE',
        body: 'WHERE 过滤**行**（分组前）；HAVING 过滤**组**（分组后）。执行顺序：WHERE → GROUP BY → HAVING。',
        code: 'SELECT dept_id, AVG(salary) AS avg_sal FROM employees\nGROUP BY dept_id\nHAVING AVG(salary) > 75000;',
      },
      {
        title: 'HAVING 示例',
        body: '找出订单数超过 1 的客户需 JOIN orders 后 GROUP BY customer_id HAVING COUNT(*) > 1。',
        code: 'SELECT customer_id, COUNT(*) AS order_count FROM orders\nGROUP BY customer_id\nHAVING COUNT(*) > 1;',
      },
      {
        title: 'WHERE 与 HAVING 同用',
        body: '先 WHERE 排除 cancelled 订单，再 GROUP BY，再 HAVING 过滤组。',
        code: "SELECT customer_id, SUM(total_amount) FROM orders\nWHERE status = 'completed'\nGROUP BY customer_id\nHAVING SUM(total_amount) > 500;",
      },
    ],
    pitfalls: [
      '在 WHERE 中写 AVG(salary) 非法（聚合不能用于 WHERE）',
      'HAVING 非聚合条件可用但通常应放 WHERE 更高效',
    ],
    readingRefs: ['Head First SQL Ch.12', 'Cookbook 4.4', 'Pocket Guide HAVING'],
  },

  18: {
    title: '聚合函数 COUNT、SUM、AVG',
    minutes: 30,
    objectives: [
      'COUNT、SUM、AVG、MIN、MAX 用法',
      'COUNT(*) vs COUNT(column) 与 NULL',
      '对 JOIN 结果做聚合',
    ],
    concepts: [
      {
        title: '五大聚合函数',
        body: 'COUNT 计数；SUM 求和；AVG 平均；MIN/MAX 最值。忽略 NULL（COUNT(*) 除外，计行数含 NULL）。',
        code: 'SELECT COUNT(*), AVG(salary), MAX(salary), MIN(salary) FROM employees;',
      },
      {
        title: 'COUNT 差异',
        body: 'COUNT(salary) 不统计 salary 为 NULL 的行；COUNT(*) 统计所有行。',
        code: 'SELECT COUNT(*) AS all_rows, COUNT(salary) AS with_salary FROM employees;',
      },
      {
        title: '业务聚合',
        body: '订单总金额、每类产品库存总和等。',
        code: 'SELECT SUM(total_amount) FROM orders WHERE status = \'completed\';\nSELECT category, SUM(stock_qty) FROM products GROUP BY category;',
      },
    ],
    pitfalls: [
      'AVG 忽略 NULL 导致样本数与 COUNT(*) 不一致',
      'SUM 对空组返回 NULL 而非 0',
    ],
    readingRefs: ['Practical SQL Ch.7', 'Pocket Guide Aggregates', 'Cookbook 4.5'],
  },

  19: {
    title: 'CASE WHEN 条件表达式',
    minutes: 32,
    objectives: [
      '简单 CASE 与搜索 CASE',
      '在 SELECT 中生成分类列',
      'CASE 与聚合配合',
    ],
    concepts: [
      {
        title: '搜索 CASE',
        body: 'CASE WHEN 条件 THEN 结果 ... ELSE 默认 END，类似 if-else 链。',
        code: "SELECT first_name,\n  CASE WHEN salary >= 90000 THEN '高薪'\n       WHEN salary >= 70000 THEN '中等'\n       ELSE '待提升' END AS level\nFROM employees;",
      },
      {
        title: '简单 CASE',
        body: 'CASE 列 WHEN 值 THEN ... 用于等值分支。',
        code: "SELECT order_id,\n  CASE status WHEN 'completed' THEN '已完成'\n              WHEN 'pending' THEN '待处理'\n              ELSE status END AS status_cn\nFROM orders;",
      },
      {
        title: 'CASE 聚合',
        body: '条件计数：高薪人数。',
        code: "SELECT COUNT(CASE WHEN salary >= 90000 THEN 1 END) AS high_pay FROM employees;",
      },
    ],
    pitfalls: [
      '忘记 END 关键字',
      'CASE 返回类型应一致（数值/文本不要混用导致隐式转换）',
    ],
    readingRefs: ['Cookbook 4.6', 'Pocket Guide CASE', 'Head First SQL Ch.13'],
  },

  20: {
    title: '字符串函数（小测日）',
    minutes: 33,
    objectives: [
      'LENGTH、UPPER、LOWER、TRIM',
      'SUBSTR / 拼接 ||',
      'REPLACE 与字符串清洗',
    ],
    concepts: [
      {
        title: '大小写与长度',
        body: 'SQLite：LENGTH、UPPER、LOWER、TRIM。',
        code: "SELECT UPPER(first_name), LOWER(email), LENGTH(last_name) FROM employees LIMIT 5;",
      },
      {
        title: 'SUBSTR 与拼接',
        body: 'SUBSTR(str, start, len) 截取；|| 连接字符串。',
        code: "SELECT first_name || ' ' || last_name AS full_name FROM employees;\nSELECT SUBSTR(hire_date, 1, 4) AS hire_year FROM employees;",
      },
      {
        title: 'REPLACE',
        body: 'REPLACE(str, old, new) 替换子串。',
        code: "SELECT REPLACE(email, '@co.com', '@company.com') FROM employees WHERE emp_id = 1;",
      },
    ],
    pitfalls: [
      'SUBSTR 起始位置为 1（SQLite）',
      'NULL 参与 || 结果为 NULL，用 COALESCE 处理',
    ],
    readingRefs: ['Cookbook 2.6', 'Pocket Guide Strings', 'Practical SQL Ch.8'],
  },

  21: {
    title: '日期函数与日期运算',
    minutes: 35,
    objectives: [
      'SQLite date()、datetime()、strftime()',
      '按年/月筛选 hire_date、order_date',
      '日期差与排序',
    ],
    concepts: [
      {
        title: '日期函数',
        body: '日期存 TEXT ISO 格式。date()、strftime() 提取部分。',
        code: "SELECT hire_date, strftime('%Y', hire_date) AS y FROM employees;\nSELECT order_date FROM orders WHERE order_date >= '2024-02-01';",
      },
      {
        title: '按月统计',
        body: 'strftime(\'%Y-%m\', order_date) 作为分组键。',
        code: "SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) FROM orders GROUP BY month;",
      },
      {
        title: '日期比较',
        body: 'ISO 字符串可直接比较大小。julianday() 可算天数差。',
        code: "SELECT * FROM employees WHERE hire_date < '2020-01-01';",
      },
    ],
    pitfalls: [
      '非 ISO 格式日期字符串排序错误',
      '时区：本课程仅用日期无时间部分',
    ],
    readingRefs: ['Cookbook 2.7', 'Practical SQL Ch.8', 'Pocket Guide Dates'],
  },

  22: {
    title: 'UNION 集合运算',
    minutes: 30,
    objectives: [
      'UNION 合并两个 SELECT 结果',
      'UNION ALL 保留重复',
      '列数与类型需兼容',
    ],
    concepts: [
      {
        title: 'UNION',
        body: '上下两个 SELECT 列数相同、对应列类型兼容。UNION 默认去重；UNION ALL 不去重。',
        code: "SELECT city AS place FROM customers\nUNION\nSELECT location AS place FROM departments;",
      },
      {
        title: 'UNION ALL',
        body: '已知无重复或需要保留重复时用 UNION ALL，性能更好。',
        code: "SELECT name FROM customers\nUNION ALL\nSELECT dept_name FROM departments;",
      },
      {
        title: '实用场景',
        body: '合并不同来源的「名称」列表；报表中合并多个状态计数（需相同列结构）。',
      },
    ],
    pitfalls: [
      '两 SELECT 列数不一致报错',
      'ORDER BY 通常放在整个 UNION 最后，只对最终结果排序',
    ],
    readingRefs: ['Pocket Guide UNION', 'Cookbook 4.7', 'Head First SQL Ch.14'],
  },

  23: {
    title: '窗口函数 ROW_NUMBER 与 RANK',
    minutes: 40,
    objectives: [
      '理解窗口函数与 GROUP BY 区别',
      'ROW_NUMBER、RANK、DENSE_RANK',
      'PARTITION BY 与 ORDER BY 在 OVER 中',
    ],
    concepts: [
      {
        title: '窗口函数概念',
        body: '在保留各行细节的同时，计算排名、累计等。OVER (PARTITION BY ... ORDER BY ...)。',
        code: 'SELECT first_name, salary,\n  ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn\nFROM employees;',
      },
      {
        title: 'PARTITION BY',
        body: '分区内排名：每个部门内按工资排名。',
        code: 'SELECT first_name, dept_id, salary,\n  RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dept_rank\nFROM employees;',
      },
      {
        title: 'RANK vs ROW_NUMBER',
        body: 'RANK 并列同名次跳号；DENSE_RANK 不跳号；ROW_NUMBER 强制唯一序号。',
      },
    ],
    pitfalls: [
      '窗口函数不能放在 WHERE 中，需用子查询或 CTE 过滤排名',
      'SQLite 3.25+ 支持窗口函数',
    ],
    readingRefs: ['Cookbook 4.8', 'Practical SQL Ch.9', 'Pocket Guide Window'],
  },

  24: {
    title: 'CTE 公用表表达式 WITH',
    minutes: 35,
    objectives: [
      'WITH 子句定义临时命名结果集',
      '提高复杂 SQL 可读性',
      '多个 CTE 链式引用',
    ],
    concepts: [
      {
        title: '基本 CTE',
        body: 'WITH cte_name AS (SELECT ...) SELECT ... FROM cte_name。可读性优于嵌套子查询。',
        code: 'WITH sf_depts AS (\n  SELECT dept_id FROM departments WHERE location = \'San Francisco\'\n)\nSELECT e.first_name, e.salary FROM employees e\nWHERE e.dept_id IN (SELECT dept_id FROM sf_depts);',
      },
      {
        title: '多 CTE',
        body: '逗号分隔多个 WITH 项，后项可引用前项。',
        code: 'WITH dept_avg AS (\n  SELECT dept_id, AVG(salary) AS avg_sal FROM employees GROUP BY dept_id\n)\nSELECT e.first_name, e.salary, d.avg_sal\nFROM employees e\nJOIN dept_avg d ON e.dept_id = d.dept_id\nWHERE e.salary > d.avg_sal;',
      },
      {
        title: 'CTE vs 子查询',
        body: '逻辑等价；CTE 便于调试（可单独运行 WITH 部分）和复用。',
      },
    ],
    pitfalls: [
      'CTE 名在同一 WITH 块内不可重复',
      '递归 CTE 本课不展开，见 Practical SQL 高级章节',
    ],
    readingRefs: ['Practical SQL Ch.9', 'Cookbook 4.9', 'Pocket Guide CTE'],
  },

  25: {
    title: '索引原理与 CREATE INDEX（小测日）',
    minutes: 32,
    objectives: [
      '理解索引加速查询的原理',
      'CREATE INDEX 与唯一索引',
      '何时不该滥建索引',
    ],
    concepts: [
      {
        title: '索引是什么',
        body: '索引像书的目录，帮助数据库快速定位行，避免全表扫描。对常出现在 WHERE、JOIN ON 的列建索引通常有益。',
        code: 'CREATE INDEX idx_employees_dept ON employees(dept_id);\nCREATE INDEX idx_orders_customer ON orders(customer_id);',
      },
      {
        title: '唯一索引',
        body: 'UNIQUE INDEX 保证列值唯一，类似 UNIQUE 约束。',
        code: 'CREATE UNIQUE INDEX idx_employees_email ON employees(email);',
      },
      {
        title: '权衡',
        body: '索引加速读、减慢写（INSERT/UPDATE 需维护索引），占存储。小练习库差异不明显，生产表需度量。',
      },
    ],
    pitfalls: [
      '对低基数列（如性别）建索引收益有限',
      '过多索引增加优化器选择成本',
    ],
    readingRefs: ['Practical SQL Ch.10', 'Pocket Guide Indexes', 'Cookbook 5.1'],
  },

  26: {
    title: '视图 VIEW',
    minutes: 30,
    objectives: [
      'CREATE VIEW 保存查询定义',
      '简化重复复杂 JOIN',
      '视图与表的区别',
    ],
    concepts: [
      {
        title: '创建视图',
        body: '视图是存起来的 SELECT，使用时像表一样查询。',
        code: 'CREATE VIEW v_employee_dept AS\nSELECT e.emp_id, e.first_name, e.last_name, d.dept_name, e.salary\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.dept_id;\n\nSELECT * FROM v_employee_dept WHERE salary > 80000;',
      },
      {
        title: '用途',
        body: '隐藏复杂 JOIN；为报表提供稳定接口；权限控制（只暴露视图列）。',
      },
      {
        title: 'DROP VIEW',
        body: 'DROP VIEW IF EXISTS v_employee_dept;',
      },
    ],
    pitfalls: [
      '视图不存储数据（标准视图），每次查询重新执行底层 SQL',
      '某些数据库支持可更新视图，SQLite 有限制',
    ],
    readingRefs: ['Cookbook 5.2', 'Practical SQL Ch.10', 'Pocket Guide Views'],
  },

  27: {
    title: '事务 TRANSACTION',
    minutes: 35,
    objectives: [
      'ACID 概念简介',
      'BEGIN、COMMIT、ROLLBACK',
      '转账式多语句原子性',
    ],
    concepts: [
      {
        title: '事务概念',
        body: '事务将多条语句绑为一个单元：全部成功 COMMIT，任一失败 ROLLBACK 撤销。保证原子性。',
        code: 'BEGIN;\nUPDATE products SET stock_qty = stock_qty - 1 WHERE product_id = 1;\nINSERT INTO order_items (item_id, order_id, product_id, quantity, unit_price) VALUES (99, 101, 1, 1, 1299.99);\nCOMMIT;',
      },
      {
        title: 'ROLLBACK',
        body: '出错或业务取消时 ROLLBACK，数据库回到 BEGIN 前状态。',
        code: 'BEGIN;\nDELETE FROM order_items WHERE item_id = 99;\nROLLBACK;',
      },
      {
        title: 'SQLite 自动提交',
        body: '默认每条语句自动提交；显式 BEGIN 开启事务块。',
      },
    ],
    pitfalls: [
      '忘记 COMMIT 导致锁持有（其他连接阻塞）',
      '长事务增加冲突与回滚段压力',
    ],
    readingRefs: ['Practical SQL Ch.11', 'Head First SQL Ch.15', 'Pocket Guide Transactions'],
  },

  28: {
    title: '导入导出概念',
    minutes: 28,
    objectives: [
      'CSV 与 SQL 脚本导入思路',
      '导出查询结果为 CSV',
      '.read / .output 等 SQLite CLI 概念',
    ],
    concepts: [
      {
        title: 'CSV 导入',
        body: '生产常用 COPY/LOAD；SQLite CLI 可用 .import。需先建表，列顺序与类型匹配。Practical SQL 强调用脚本讲故事式导入真实数据集。',
      },
      {
        title: 'SQL 导出',
        body: 'pg_dump、mysqldump 导出 DDL+DML；本课程 schema.js 即 SEED_SQL 文本执行方式。',
      },
      {
        title: '导出查询',
        body: '应用层将 SELECT 结果写 CSV；CLI：.mode csv / .output file.csv。',
        code: '-- 概念示例（CLI）\n-- .mode csv\n-- .output employees.csv\n-- SELECT * FROM employees;',
      },
    ],
    pitfalls: [
      'CSV 含逗号或换行需引号转义',
      '导入顺序需满足外键：先 departments 再 employees',
    ],
    readingRefs: ['Practical SQL Ch.12', 'Cookbook 1.3', 'Pocket Guide CLI'],
  },

  29: {
    title: '综合复习项目',
    minutes: 45,
    objectives: [
      '完成跨多表的报表查询',
      '组合 JOIN、GROUP BY、HAVING、子查询',
      '为最终考试做实战演练',
    ],
    concepts: [
      {
        title: '项目：客户订单分析',
        body: '统计每位客户的 completed 订单数与总金额；列出购买 Electronics 类商品的客户名；找出从未下单的客户（LEFT JOIN + IS NULL）。',
        code: "SELECT c.name, COUNT(o.order_id) AS n, SUM(o.total_amount) AS total\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id AND o.status = 'completed'\nGROUP BY c.customer_id, c.name;",
      },
      {
        title: '项目：部门人力',
        body: '各部门人数、平均工资、最高工资；工资高于本部门平均的员工列表（JOIN + 子查询/CTE）。',
      },
      {
        title: '自检清单',
        body: '能否独立写出：过滤、排序、JOIN、分组、HAVING、CASE、窗口排名前 N？薄弱点回到对应天数复习。',
      },
    ],
    pitfalls: [
      '综合题先画表关系再写 SQL',
      '分步验证：先 JOIN 看行数，再加 GROUP BY',
    ],
    readingRefs: ['Practical SQL 全书回顾', 'Cookbook 综合章节', 'Head First SQL 复习'],
  },

  30: {
    title: '期末准备与应试策略',
    minutes: 40,
    objectives: [
      '回顾 30 天知识地图',
      '掌握常见错题类型',
      '完成模拟最终考试',
    ],
    concepts: [
      {
        title: '知识地图',
        body: '第1-4天：SELECT/WHERE/ORDER BY；5-9：NULL/DML/DDL/键；10-14：JOIN/子查询；15-19：分组/聚合/CASE；20-24：字符串/日期/UNION/窗口/CTE；25-28：索引/视图/事务/导入导出。',
      },
      {
        title: '应试技巧',
        body: 'SQL 题：先读题确定输出列 → 选表 → JOIN 路径 → WHERE → GROUP BY/HAVING → ORDER BY。MCQ：注意 NULL、INNER vs LEFT、WHERE vs HAVING。',
      },
      {
        title: '模拟建议',
        body: '完成 getFinal() 20 题；错题回到 lessons 与 daily set 重做。祝考试顺利！',
      },
    ],
    pitfalls: [
      '期末时间紧时不要跳过 ORDER BY 题目要求的排序',
      '窗口函数题注意 PARTITION BY 范围',
    ],
    readingRefs: ['Pocket Guide 全书', 'Practical SQL 附录', 'Cookbook 索引'],
  },
};
