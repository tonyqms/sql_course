/**
 * Grade MCQ and SQL questions (result-set comparison via sql.js).
 */

export function gradeMcq(question, selectedIndex) {
  const correct = selectedIndex === question.answer;
  return {
    correct,
    feedback: correct
      ? `✓ 正确！${question.explanation || ''}`
      : `✗ 错误。正确答案是：${question.options[question.answer]}。${question.explanation || ''}`,
  };
}

export function gradeSql(question, userSql, db, runQuery) {
  if (!userSql || !userSql.trim()) {
    return { correct: false, feedback: '请先输入 SQL 查询。' };
  }

  const cleaned = userSql.trim().replace(/;+\s*$/, '');

  if (question.forbidden) {
    for (const f of question.forbidden) {
      if (new RegExp(f, 'i').test(cleaned)) {
        return { correct: false, feedback: `此题不允许使用 ${f}。` };
      }
    }
  }

  try {
    if (question.validateBy === 'contains') {
      const norm = cleaned.toLowerCase().replace(/\s+/g, ' ');
      const ok = question.mustContain.every((p) => norm.includes(p.toLowerCase()));
      return {
        correct: ok,
        feedback: ok
          ? `✓ 正确！${question.explanation || ''}`
          : `✗ 未满足要求。${question.explanation || ''}`,
      };
    }

    const userResult = runQuery(db, cleaned);
    const expectedSql = question.expectedSql || question.answerSql;
    const expectedResult = runQuery(db, expectedSql);
    const columnMode = question.columnMode || 'exact';

    let match = false;
    if (columnMode === 'requiredColumns') {
      match = compareRequiredColumns(userResult, expectedResult, question.orderMatters);
    } else {
      match = compareResults(userResult, expectedResult, question.orderMatters);
    }

    if (match) {
      return {
        correct: true,
        feedback: `✓ 查询结果正确！${question.explanation || ''}`,
        userResult,
        expectedResult,
      };
    }

    const diagnosis = diagnoseResultMismatch(userResult, expectedResult, columnMode);
    return {
      correct: false,
      feedback: `✗ ${diagnosis}${question.explanation ? ' ' + question.explanation : ''}${question.hint ? ' 提示：' + question.hint : ''}`,
      userResult,
      expectedResult,
    };
  } catch (e) {
    return { correct: false, feedback: `SQL 错误：${e.message}` };
  }
}

export function runQuery(db, sql) {
  const stmts = sql.split(';').map((s) => s.trim()).filter(Boolean);
  let last;
  for (const s of stmts) {
    const upper = s.toUpperCase();
    if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
      last = db.exec(s);
    } else {
      db.run(s);
      last = { changes: true };
    }
  }
  return normalizeResult(last);
}

function normalizeResult(execResult) {
  if (!execResult || execResult.changes) return { columns: [], rows: [] };
  if (!Array.isArray(execResult) || execResult.length === 0) {
    return { columns: [], rows: [] };
  }
  const { columns, values } = execResult[0];
  return {
    columns: columns || [],
    rows: (values || []).map((row) => {
      const obj = {};
      columns.forEach((c, i) => {
        obj[c] = row[i];
      });
      return obj;
    }),
  };
}

/**
 * Parse SELECT/WITH output column names (prefer aliases) and whether WHERE exists.
 */
export function extractSelectOutputSpec(sql) {
  if (!sql || typeof sql !== 'string') return { columns: [], hasWhere: false };

  const stripped = sql.replace(/;+\s*$/, '').trim();
  // Prefer the outermost/final SELECT (skip CTE inner SELECTs).
  const selectMatch = findFinalSelect(stripped);
  if (!selectMatch) return { columns: [], hasWhere: /\bWHERE\b/i.test(stripped) };

  const selectList = selectMatch.list.trim();
  const tail = selectMatch.tail || '';
  const hasWhere = /\bWHERE\b/i.test(tail) || /\bWHERE\b/i.test(stripped);

  if (selectList === '*') return { columns: ['*'], hasWhere };

  const parts = splitSqlList(selectList);
  const columns = parts
    .map((part) => {
      const asMatch = part.match(/\bAS\s+("([^"]+)"|`([^`]+)`|\[([^\]]+)\]|([A-Za-z_][\w$]*))\s*$/i);
      if (asMatch) return asMatch[2] || asMatch[3] || asMatch[4] || asMatch[5];

      const trailingIdent = part.match(/(?:^|[\s.])("([^"]+)"|`([^`]+)`|\[([^\]]+)\]|([A-Za-z_][\w$]*))\s*$/);
      if (trailingIdent) return trailingIdent[2] || trailingIdent[3] || trailingIdent[4] || trailingIdent[5];

      return part.trim();
    })
    .filter(Boolean);

  return { columns, hasWhere };
}

function findFinalSelect(sql) {
  let depth = 0;
  let quote = null;
  let last = null;
  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '(') {
      depth += 1;
      continue;
    }
    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth !== 0) continue;
    if (/^SELECT\b/i.test(sql.slice(i))) {
      const afterSelect = sql.slice(i).replace(/^SELECT\s+(DISTINCT\s+)?/i, '');
      const fromMatch = afterSelect.match(/^([\s\S]+?)\s+FROM\s([\s\S]*)$/i);
      if (fromMatch) {
        last = { list: fromMatch[1], tail: fromMatch[2] };
      }
    }
  }
  return last;
}

function splitSqlList(list) {
  const parts = [];
  let current = '';
  let depth = 0;
  let quote = null;
  for (let i = 0; i < list.length; i += 1) {
    const ch = list[i];
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === '(') {
      depth += 1;
      current += ch;
      continue;
    }
    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      current += ch;
      continue;
    }
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export function diagnoseResultMismatch(userResult, expectedResult, columnMode = 'exact') {
  const userCols = userResult?.columns || [];
  const expectedCols = expectedResult?.columns || [];
  const userSet = new Set(userCols);
  const expectedSet = new Set(expectedCols);

  const missing = expectedCols.filter((c) => !userSet.has(c));
  const extra = userCols.filter((c) => !expectedSet.has(c));

  if (missing.length || (columnMode === 'exact' && extra.length)) {
    const bits = [];
    if (missing.length) bits.push(`缺少列：${missing.join(', ')}`);
    if (columnMode === 'exact' && extra.length) {
      bits.push(`多余列：${extra.join(', ')}（本题要求只返回：${expectedCols.join(', ')}）`);
    }
    if (columnMode === 'requiredColumns' && missing.length) {
      bits.push(`本题至少需要列：${expectedCols.join(', ')}`);
    }
    return `结果列不匹配。${bits.join('；')}。`;
  }

  if ((userResult?.rows?.length || 0) !== (expectedResult?.rows?.length || 0)) {
    return `行数不匹配（你的 ${userResult.rows.length} 行，期望 ${expectedResult.rows.length} 行）。检查 WHERE/JOIN/GROUP BY。`;
  }

  return '结果不匹配。请核对筛选条件、聚合与行内容。';
}

export function compareResults(a, b, orderMatters = false) {
  if (a.columns.length !== b.columns.length) return false;
  const colsA = [...a.columns].sort();
  const colsB = [...b.columns].sort();
  if (colsA.join() !== colsB.join()) return false;

  const colMap = b.columns;
  const normalizedA = a.rows.map((r) => colMap.map((c) => stringify(r[c])));
  const normalizedB = b.rows.map((r) => colMap.map((c) => stringify(r[c])));

  if (orderMatters) {
    return JSON.stringify(normalizedA) === JSON.stringify(normalizedB);
  }

  const sortRows = (rows) => rows.map((r) => r.join('\t')).sort().join('\n');
  return sortRows(normalizedA) === sortRows(normalizedB);
}

function compareRequiredColumns(userResult, expectedResult, orderMatters = false) {
  const expectedCols = expectedResult.columns || [];
  const userSet = new Set(userResult.columns || []);
  if (expectedCols.some((c) => !userSet.has(c))) return false;

  const projected = {
    columns: expectedCols,
    rows: (userResult.rows || []).map((row) => {
      const obj = {};
      expectedCols.forEach((c) => {
        obj[c] = row[c];
      });
      return obj;
    }),
  };
  return compareResults(projected, expectedResult, orderMatters);
}

function stringify(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(Number(v.toFixed(4)));
  return String(v).trim();
}

export function gradeSet(questions, answers, db, runQuery) {
  let score = 0;
  const wrong = [];
  const details = [];

  questions.forEach((q, i) => {
    const ans = answers[i];
    let result;
    if (q.type === 'mcq') {
      result = gradeMcq(q, ans);
    } else {
      result = gradeSql(q, ans, db, runQuery);
    }
    if (result.correct) score++;
    else {
      wrong.push({
        id: q.id,
        type: q.type,
        topic: q.topic,
        question: q.question,
        explanation: q.explanation,
      });
    }
    details.push({ ...result, id: q.id });
  });

  return { score, total: questions.length, wrong, details };
}

/** Build a short learner-facing output contract from expected SQL. */
export function formatOutputContract(expectedSql, columnMode = 'exact') {
  const spec = extractSelectOutputSpec(expectedSql || '');
  if (!spec.columns.length || spec.columns[0] === '*') return '';
  const cols = spec.columns.join(', ');
  if (columnMode === 'requiredColumns') {
    return `输出要求：至少包含列 ${cols}`;
  }
  return `输出要求：只返回列 ${cols}`;
}
