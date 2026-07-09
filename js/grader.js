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

    const match = compareResults(userResult, expectedResult, question.orderMatters);
    return {
      correct: match,
      feedback: match
        ? `✓ 查询结果正确！${question.explanation || ''}`
        : `✗ 结果不匹配。${question.explanation || ''}${question.hint ? ' 提示：' + question.hint : ''}`,
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
      columns.forEach((c, i) => { obj[c] = row[i]; });
      return obj;
    }),
  };
}

function compareResults(a, b, orderMatters = false) {
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

  const sortRows = (rows) =>
    rows.map((r) => r.join('\t')).sort().join('\n');
  return sortRows(normalizedA) === sortRows(normalizedB);
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
