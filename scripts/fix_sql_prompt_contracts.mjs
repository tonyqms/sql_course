/**
 * Append explicit output-column contracts to SELECT SQL prompts
 * so learners know exactly which columns grading requires.
 *
 * Usage: node scripts/fix_sql_prompt_contracts.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
import { extractSelectOutputSpec } from '../js/grader.js';

const path = new URL('../data/questions.js', import.meta.url);

function loadApi(source) {
  const rewritten = source.replace(/export function /g, 'function ');
  return new vm.Script(`${rewritten}\n({ getDailySet, getQuiz, getMidterm, getFinal });`, {
    filename: 'questions.js',
  }).runInNewContext({});
}

function collectQuestions(api) {
  const all = [];
  for (let day = 1; day <= 30; day += 1) {
    for (const setId of ['A', 'B', 'C']) {
      for (const q of api.getDailySet(day, setId)) all.push(q);
    }
  }
  for (let quiz = 1; quiz <= 5; quiz += 1) {
    for (const q of api.getQuiz(quiz)) all.push(q);
  }
  for (const q of api.getMidterm()) all.push(q);
  for (const q of api.getFinal()) all.push(q);
  return all;
}

/** Hand-tuned rewrites for the worst ambiguity cases. */
const MANUAL = {
  'd6c-s1':
    '查询每个订单的 order_id，以及把 total_amount 四舍五入到整数后的结果（ROUND），列名 rounded。只返回这两列。',
  'd6c-s2':
    '查询员工 first_name，以及工资税 tax（salary * 0.2）。只返回这两列，并排除 salary 为 NULL 的员工。',
  'd6c-s3':
    '查询 unit_price 大于 100 的商品名 product_name。只返回 product_name 这一列（不要附带 unit_price）。',
  'd6b-s2':
    '查询 products 的 product_name，以及 stock_qty * unit_price 作为 inventory_value。只返回这两列。',
  'd5a-s3':
    '列出员工 first_name，以及工资 salary；若 salary 为 NULL 则显示为 0（COALESCE），列名仍为 salary。只返回这两列。',
  'd5c-s2':
    '查询没有上级的员工（manager_id IS NULL），返回 first_name 与 last_name。只返回这两列。',
  'd5c-s3':
    '显示订单 order_id 与 total_amount；若 total_amount 为 NULL 则显示为 0（COALESCE）。只返回这两列。',
  'd4a-s2':
    '按 unit_price 降序取最贵的前 2 个商品名称 product_name。只返回 product_name，顺序要正确。',
  'd4b-s1':
    'employees 按 hire_date 升序（入职早的在前），返回 first_name 与 hire_date。只返回这两列。',
  'd4c-s1':
    'orders 按 total_amount 从高到低，返回 order_id 与 total_amount。只返回这两列。',
};

function contractFor(q) {
  if (MANUAL[q.id]) return null; // fully replaced
  const sql = q.expectedSql || q.answerSql || '';
  if (!/^\s*(WITH|SELECT)\b/i.test(sql)) return null;
  const spec = extractSelectOutputSpec(sql);
  if (!spec.columns.length) return null;

  if (spec.columns.length === 1 && spec.columns[0] === '*') {
    if (/全部|所有列|完整|SELECT \*|全部数据|全部行|全部客户|全部明细|全部.*员工|所有商品|所有订单/.test(q.question)) {
      return '输出：SELECT *（全部列）。';
    }
    return '输出：返回全部列（SELECT *）。';
  }

  const cols = spec.columns.filter((c) => c !== '*' && !c.includes('('));
  if (!cols.length) return null;

  const missing = cols.filter((c) => !String(q.question).toLowerCase().includes(c.toLowerCase()));
  if (!missing.length && /只返回|仅返回|输出列|输出要求/.test(q.question)) return null;

  if (missing.length || !/只返回|仅返回|输出列|输出要求/.test(q.question)) {
    return `只返回列：${cols.join(', ')}。`;
  }
  return null;
}

function escapeForSingleQuotedJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escapeForDoubleQuotedJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function replaceQuestionText(source, id, newQuestion) {
  const idToken = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Object form: { id: '...', ..., question: '...' }
  const objectRe = new RegExp(
    `(id:\\s*['"]${idToken}['"][\\s\\S]{0,260}?question:\\s*)(['"])([\\s\\S]*?)\\2`,
    'm'
  );
  if (objectRe.test(source)) {
    const quote = source.match(objectRe)[2];
    const escaped = quote === "'" ? escapeForSingleQuotedJs(newQuestion) : escapeForDoubleQuotedJs(newQuestion);
    return { source: source.replace(objectRe, `$1${quote}${escaped}${quote}`), ok: true };
  }

  // Helper form: sqlQ('id', 'topic', 'question', 'expectedSql', ...)
  const helperRe = new RegExp(
    `(sqlQ\\(\\s*['"]${idToken}['"]\\s*,\\s*['"][^'"]*['"]\\s*,\\s*)(['"])([\\s\\S]*?)\\2(\\s*,)`,
    'm'
  );
  if (helperRe.test(source)) {
    const m = source.match(helperRe);
    const quote = m[2];
    const escaped = quote === "'" ? escapeForSingleQuotedJs(newQuestion) : escapeForDoubleQuotedJs(newQuestion);
    return { source: source.replace(helperRe, `$1${quote}${escaped}${quote}$4`), ok: true };
  }

  return { source, ok: false };
}

const source = await readFile(path, 'utf8');
const api = loadApi(source);
const questions = collectQuestions(api);

let updated = source;
let changed = 0;
const failures = [];

for (const q of questions) {
  if (q.type !== 'sql') continue;
  if (q.validateBy === 'contains') continue;

  let newQ = MANUAL[q.id] || null;
  if (!newQ) {
    const suffix = contractFor(q);
    if (!suffix) continue;
    if (q.question.includes(suffix)) continue;
    newQ = `${q.question.replace(/[。\s]*$/, '')}。${suffix}`;
  }

  if (newQ === q.question) continue;
  const result = replaceQuestionText(updated, q.id, newQ);
  if (!result.ok) {
    failures.push(q.id);
    continue;
  }
  updated = result.source;
  changed += 1;
}

await writeFile(path, updated);
console.log(`Updated ${changed} SQL prompts.`);
if (failures.length) {
  console.log('Failed to rewrite:', failures.join(', '));
  process.exitCode = 1;
}
