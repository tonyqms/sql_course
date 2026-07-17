import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import {
  gradeSql,
  extractSelectOutputSpec,
  diagnoseResultMismatch,
  compareResults,
} from '../js/grader.js';

test('extractSelectOutputSpec reads columns and WHERE from expected SQL', () => {
  const spec = extractSelectOutputSpec(
    "SELECT order_id, ROUND(total_amount) AS rounded FROM orders WHERE status = 'completed'"
  );
  assert.deepEqual(spec.columns, ['order_id', 'rounded']);
  assert.equal(spec.hasWhere, true);
});

test('extractSelectOutputSpec handles DISTINCT and bare columns', () => {
  const spec = extractSelectOutputSpec('SELECT DISTINCT country FROM customers');
  assert.deepEqual(spec.columns, ['country']);
  assert.equal(spec.hasWhere, false);
});

test('diagnoseResultMismatch explains extra and missing columns', () => {
  const extra = diagnoseResultMismatch(
    { columns: ['product_name', 'unit_price'], rows: [] },
    { columns: ['product_name'], rows: [] }
  );
  assert.match(extra, /多余|extra/i);

  const missing = diagnoseResultMismatch(
    { columns: ['rounded'], rows: [] },
    { columns: ['order_id', 'rounded'], rows: [] }
  );
  assert.match(missing, /缺少|missing/i);
});

test('exact mode rejects extra columns; requiredColumns accepts matching required values', () => {
  const expectedRows = [
    { product_name: 'Laptop Pro' },
    { product_name: 'Monitor 27in' },
  ];
  const userExactExtra = {
    columns: ['product_name', 'unit_price'],
    rows: [
      { product_name: 'Laptop Pro', unit_price: 1299.99 },
      { product_name: 'Monitor 27in', unit_price: 399.99 },
    ],
  };
  const expected = { columns: ['product_name'], rows: expectedRows };

  const runQuery = (db, sql) => {
    // Distinguish by SELECT list, not WHERE (expected SQL also mentions unit_price).
    if (/select\s+product_name\s*,\s*unit_price/i.test(sql)) return userExactExtra;
    return expected;
  };

  const exact = gradeSql(
    {
      type: 'sql',
      expectedSql: 'SELECT product_name FROM products WHERE unit_price > 100',
      explanation: 'only product_name',
    },
    'SELECT product_name, unit_price FROM products WHERE unit_price > 100',
    {},
    runQuery
  );
  assert.equal(exact.correct, false);
  assert.match(exact.feedback, /多余|列/i);

  const required = gradeSql(
    {
      type: 'sql',
      expectedSql: 'SELECT product_name FROM products WHERE unit_price > 100',
      columnMode: 'requiredColumns',
      explanation: 'product_name required',
    },
    'SELECT product_name, unit_price FROM products WHERE unit_price > 100',
    {},
    runQuery
  );
  assert.equal(required.correct, true);
});

test('compareResults still requires same columns in exact mode', () => {
  assert.equal(
    compareResults(
      { columns: ['a'], rows: [{ a: 1 }] },
      { columns: ['a', 'b'], rows: [{ a: 1, b: 2 }] }
    ),
    false
  );
});

async function loadQuestionsModule() {
  const source = await readFile(new URL('../data/questions.js', import.meta.url), 'utf8');
  const rewritten = source.replace(/export function /g, 'function ');
  const script = new vm.Script(
    `${rewritten}\n({ getDailySet, getQuiz, getMidterm, getFinal });`,
    { filename: 'questions.js' }
  );
  return script.runInNewContext({});
}

test('SQL prompts mention every expected output column for SELECT questions', async () => {
  const api = await loadQuestionsModule();
  const failures = [];

  function check(q, where) {
    if (q.type !== 'sql') return;
    if (q.validateBy === 'contains') return;
    const sql = q.expectedSql || q.answerSql || '';
    if (!/^\s*(WITH|SELECT)\b/i.test(sql)) return;
    const spec = extractSelectOutputSpec(sql);
    if (!spec?.columns?.length) return;
    const text = String(q.question).toLowerCase();
    for (const col of spec.columns) {
      if (col === '*' || col.includes('(')) continue; // SELECT * / unaliased expressions
      if (!text.includes(col.toLowerCase())) {
        failures.push(`${where} [${q.id}] missing column "${col}" in prompt: ${q.question}`);
      }
    }
  }

  for (let day = 1; day <= 30; day += 1) {
    for (const setId of ['A', 'B', 'C']) {
      for (const q of api.getDailySet(day, setId)) check(q, `day${day}${setId}`);
    }
  }
  for (let quiz = 1; quiz <= 5; quiz += 1) {
    for (const q of api.getQuiz(quiz)) check(q, `quiz${quiz}`);
  }
  for (const q of api.getMidterm()) check(q, 'midterm');
  for (const q of api.getFinal()) check(q, 'final');

  assert.equal(
    failures.length,
    0,
    failures.slice(0, 50).join('\n') + (failures.length > 50 ? `\n...and ${failures.length - 50} more` : '')
  );
});
