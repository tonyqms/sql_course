import { initDatabase, cloneFreshDb } from './schema.js?v=3';
import { loadProgress, saveProgress, getDayProgress, recordSetScore, recordQuiz, recordExam, getStats, resetProgress, startRound2, exportReport, markWrongMastered, addWrong } from './progress.js?v=3';
import { buildRound2Order } from './dag.js?v=3';
import { gradeSet, runQuery } from './grader.js?v=3';
import { LESSONS } from '../data/lessons.js?v=3';
import { getDailySet, getQuiz, getMidterm, getFinal } from '../data/questions.js?v=3';

let SQL = null;
let templateDb = null;
let state = loadProgress();
let currentDay = state.currentDay || 1;
let currentSet = 'A';
let currentAnswers = {};
let activeQuestions = [];

const QUIZ_DAYS = { 5: 1, 10: 2, 15: 3, 20: 4, 25: 5 };
const EXAM_DAYS = { 15: 'midterm', 30: 'final' };

async function boot() {
  try {
    setLoadingMessage('正在初始化本地 SQL 引擎…');
    if (typeof initSqlJs !== 'function') {
      throw new Error('sql.js 没有加载成功，请确认 vendor/sql-wasm.min.js 存在。');
    }

    SQL = await withTimeout(
      initSqlJs({
        locateFile: (f) => `vendor/${f}`,
      }),
      10000,
      'SQL 引擎初始化超时，请刷新页面或检查 vendor/sql-wasm.wasm 是否可访问。'
    );

    setLoadingMessage('正在创建练习数据库…');
    templateDb = await initDatabase(SQL);
    document.getElementById('loading').classList.add('hidden');
    bindGlobal();
    renderSidebar();
    renderDay(currentDay);
    updateStats();
  } catch (e) {
    document.getElementById('loading').innerHTML = `<p style="color:#ef4444">加载失败：${e.message}<br>请通过本地 HTTP 服务器打开（见 README）。</p>`;
  }
}

function setLoadingMessage(message) {
  const loading = document.getElementById('loading');
  const p = loading ? loading.querySelector('p') : null;
  if (p) p.textContent = message;
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

function bindGlobal() {
  document.getElementById('toggle-sidebar').onclick = () => {
    document.getElementById('sidebar').classList.toggle('open');
  };
  document.getElementById('btn-wrong-book').onclick = () => showView('wrong');
  document.getElementById('btn-report').onclick = () => showReport();
  document.getElementById('btn-round2').onclick = () => {
    if (state.round >= 2) return alert('已在第 2 轮学习中');
    if (!confirm('开始第 2 轮？无依赖的章节将打乱顺序，进度保留。')) return;
    startRound2(state, buildRound2Order());
    updateStats();
    renderSidebar();
    alert('第 2 轮已开始！侧边栏显示的是学习顺序。');
  };
  document.getElementById('btn-reset').onclick = () => {
    if (!confirm('确定重置所有进度、错题本？')) return;
    state = resetProgress();
    currentDay = 1;
    renderSidebar();
    renderDay(1);
    updateStats();
  };
  document.getElementById('btn-back-from-wrong').onclick = () => showView('day');
  document.getElementById('btn-back-from-report').onclick = () => showView('day');
  document.getElementById('btn-submit-set').onclick = submitCurrentSet;
}

function showView(name) {
  document.getElementById('view-day').classList.toggle('view-hidden', name !== 'day');
  document.getElementById('view-wrong').classList.toggle('view-hidden', name !== 'wrong');
  document.getElementById('view-report').classList.toggle('view-hidden', name !== 'report');
  if (name === 'wrong') renderWrongBook();
}

function showReport() {
  const report = exportReport(state);
  document.getElementById('report-json').textContent = JSON.stringify(report, null, 2);
  showView('report');
}

function updateStats() {
  const s = getStats(state);
  document.getElementById('stat-progress').textContent = `${s.completed}/30`;
  document.getElementById('stat-streak').textContent = s.streak;
  document.getElementById('stat-wrong').textContent = s.wrongActive;
  document.getElementById('stat-round').textContent = `第 ${s.round} 轮`;
}

function renderSidebar() {
  const grid = document.getElementById('day-grid');
  grid.innerHTML = '';
  const order = state.round === 2 && state.dayOrder ? state.dayOrder : Array.from({ length: 30 }, (_, i) => i + 1);

  order.forEach((day, idx) => {
    const btn = document.createElement('button');
    btn.className = 'day-btn';
    btn.textContent = state.round === 2 ? `${idx + 1}` : day;
    btn.title = `Day ${day}: ${LESSONS[day] ? LESSONS[day].title : ''}`;
    const dp = state.days[day];
    if (dp && dp.completed) btn.classList.add('done');
    if (day === currentDay) btn.classList.add('active');
    if (QUIZ_DAYS[day]) btn.classList.add('quiz-day');
    if (EXAM_DAYS[day]) btn.classList.add('exam-day');
    btn.onclick = () => {
      currentDay = day;
      state.currentDay = day;
      saveProgress(state);
      renderSidebar();
      renderDay(day);
      document.getElementById('sidebar').classList.remove('open');
    };
    grid.appendChild(btn);
  });
}

function renderDay(day) {
  const lesson = LESSONS[day];
  if (!lesson) return;

  const dp = getDayProgress(state, day);
  const isQuiz = QUIZ_DAYS[day];
  const examType = EXAM_DAYS[day];

  document.getElementById('min-task-banner').innerHTML =
    `⏱ 预计 ${lesson.minutes} 分钟 · <strong>今日最低任务</strong>：完成任意 1 套练习且得分 ≥60% 即算打卡。` +
    (dp.minTaskDone ? ' <span style="color:var(--accent2)">✓ 今日已打卡</span>' : '');

  document.getElementById('day-header').innerHTML = `
    <h2 style="font-size:1.5rem;margin-bottom:0.25rem">Day ${day} · ${lesson.title}</h2>
    <p style="color:var(--muted);font-size:0.9rem;margin-bottom:1rem">
      ${isQuiz ? '<span style="color:var(--warn)">📝 今日含阶段 Quiz</span> · ' : ''}
      ${examType === 'midterm' ? '<span style="color:var(--danger)">🎓 期中考试</span> · ' : ''}
      ${examType === 'final' ? '<span style="color:var(--danger)">🏁 期末考试</span> · ' : ''}
      阅读参考（请使用你本地的 PDF 教材）：${lesson.readingRefs.join(' · ')}
    </p>`;

  renderLessonPanels(lesson, dp);
  renderExerciseTabs(day);

  const quizEl = document.getElementById('quiz-container');
  quizEl.classList.add('view-hidden');
  quizEl.innerHTML = '';

  if (isQuiz) renderQuizSection(day, QUIZ_DAYS[day]);
  if (examType) renderExamSection(examType);
}

function renderLessonPanels(lesson, dp) {
  const container = document.getElementById('lesson-panels');
  const objectivesHtml = lesson.objectives.map((o) => `<li>${o}</li>`).join('');
  const conceptsHtml = lesson.concepts
    .map(
      (c) => `
    <div class="concept-block">
      <h4>${c.title}</h4>
      <p>${c.body.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>')}</p>
      ${c.code ? `<pre>${escapeHtml(c.code)}</pre>` : ''}
    </div>`
    )
    .join('');
  const pitfallsHtml = lesson.pitfalls.map((p) => `<li>${p}</li>`).join('');

  container.innerHTML = `
    <div class="panel open" id="panel-objectives">
      <div class="panel-header" onclick="togglePanel('panel-objectives')">
        <h3>今日目标</h3><span class="chevron">▼</span>
      </div>
      <div class="panel-body" style="display:block">
        <ul class="objectives">${objectivesHtml}</ul>
        <button class="btn btn-secondary btn-sm" id="mark-read">${dp.lessonRead ? '✓ 已标记阅读' : '标记课文已读'}</button>
      </div>
    </div>
    <div class="panel open" id="panel-concepts">
      <div class="panel-header" onclick="togglePanel('panel-concepts')">
        <h3>核心知识（点击折叠）</h3><span class="chevron">▼</span>
      </div>
      <div class="panel-body" style="display:block">
        ${conceptsHtml}
        <div class="reading-refs"><strong>教材章节：</strong>${lesson.readingRefs.map((r) => `<span>${r}</span>`).join('')}</div>
        <p style="margin-top:0.75rem;font-size:0.85rem;color:var(--muted)">⚠️ 课程内容为本工具原创摘要，请结合你 Downloads/book 目录下的 PDF 教材深入学习。</p>
      </div>
    </div>
    <div class="panel" id="panel-pitfalls">
      <div class="panel-header" onclick="togglePanel('panel-pitfalls')">
        <h3>常见坑</h3><span class="chevron">▼</span>
      </div>
      <div class="panel-body">
        <ul class="objectives">${pitfallsHtml}</ul>
      </div>
    </div>`;

  document.getElementById('mark-read').onclick = (e) => {
    dp.lessonRead = true;
    saveProgress(state);
    e.target.textContent = '✓ 已标记阅读';
  };
}

window.togglePanel = function (id) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
  const body = el.querySelector('.panel-body');
  body.style.display = el.classList.contains('open') ? 'block' : 'none';
};

function renderExerciseTabs(day) {
  const tabs = document.getElementById('exercise-tabs');
  tabs.innerHTML = '';
  ['A', 'B', 'C'].forEach((setId) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (setId === currentSet ? ' active' : '');
    const sc = state.days[day] && state.days[day].sets ? state.days[day].sets[setId] : null;
    btn.textContent = `套题 ${setId}` + (sc ? ` (${sc.score}/${sc.total})` : '');
    btn.onclick = () => {
      currentSet = setId;
      renderExerciseTabs(day);
      loadQuestionSet(day, setId);
    };
    tabs.appendChild(btn);
  });
  loadQuestionSet(day, currentSet);
}

function loadQuestionSet(day, setId) {
  activeQuestions = getDailySet(day, setId);
  currentAnswers = {};
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  activeQuestions.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.dataset.index = i;

    if (q.type === 'mcq') {
      const opts = q.options
        .map(
          (opt, oi) => `
        <label class="mcq-option" data-opt="${oi}">
          <input type="radio" name="q${i}" value="${oi}" />
          <span>${escapeHtml(opt)}</span>
        </label>`
        )
        .join('');
      card.innerHTML = `
        <div class="q-num"><span class="tag tag-mcq">选择题</span> 第 ${i + 1} 题 · ${q.topic}</div>
        <div class="q-text">${escapeHtml(q.question)}</div>
        <div class="mcq-options">${opts}</div>
        <div class="feedback" id="fb-${i}"></div>`;
      card.querySelectorAll('.mcq-option').forEach((label) => {
        label.onclick = () => {
          card.querySelectorAll('.mcq-option').forEach((l) => l.classList.remove('selected'));
          label.classList.add('selected');
          label.querySelector('input').checked = true;
          currentAnswers[i] = +label.dataset.opt;
        };
      });
    } else {
      card.innerHTML = `
        <div class="q-num"><span class="tag tag-sql">SQL 题</span> 第 ${i + 1} 题 · ${q.topic}</div>
        <div class="q-text">${escapeHtml(q.question)}</div>
        <textarea class="sql-editor" id="sql-${i}" placeholder="在此输入 SQL…"></textarea>
        <button class="btn btn-secondary btn-sm" style="margin-top:0.5rem" onclick="runPreview(${i})">▶ 试运行（不记分）</button>
        <div class="feedback" id="fb-${i}"></div>
        <pre id="preview-${i}" style="display:none;margin-top:0.5rem;font-size:0.75rem;max-height:120px;overflow:auto"></pre>`;
    }
    container.appendChild(card);
  });

  document.getElementById('score-bar').style.display = 'flex';
  document.getElementById('score-text').textContent = '完成题目后点击提交打分';
}

window.runPreview = function (i) {
  const sql = document.getElementById(`sql-${i}`).value;
  const db = cloneFreshDb(SQL, templateDb);
  try {
    const result = runQuery(db, sql);
    const pre = document.getElementById(`preview-${i}`);
    pre.style.display = 'block';
    pre.textContent = formatResult(result);
  } catch (e) {
    alert('错误：' + e.message);
  }
};

function formatResult(result) {
  if (!result.rows.length) return '(空结果集)';
  const header = result.columns.join('\t');
  const rows = result.rows.map((r) => result.columns.map((c) => r[c]).join('\t'));
  return header + '\n' + rows.join('\n');
}

function submitCurrentSet() {
  activeQuestions.forEach((q, i) => {
    if (q.type === 'sql') {
      const editor = document.getElementById(`sql-${i}`);
      currentAnswers[i] = editor ? editor.value : '';
    }
  });

  const db = cloneFreshDb(SQL, templateDb);
  const { score, total, wrong, details } = gradeSet(activeQuestions, currentAnswers, db, runQuery);

  details.forEach((d, i) => {
    const fb = document.getElementById(`fb-${i}`);
    if (!fb) return;
    fb.className = 'feedback show ' + (d.correct ? 'correct' : 'wrong');
    fb.textContent = d.feedback;

    if (activeQuestions[i].type === 'mcq') {
      const card = fb.closest('.question-card');
      card.querySelectorAll('.mcq-option').forEach((opt, oi) => {
        if (oi === activeQuestions[i].answer) opt.classList.add('correct');
        else if (oi === currentAnswers[i]) opt.classList.add('wrong');
      });
    }
  });

  recordSetScore(state, currentDay, currentSet, score, total, wrong);
  document.getElementById('score-text').textContent = `得分：${score} / ${total}（${Math.round((score / total) * 100)}%）`;
  updateStats();
  renderSidebar();
  renderExerciseTabs(currentDay);
}

function renderQuizSection(day, quizNum) {
  const el = document.getElementById('quiz-container');
  el.classList.remove('view-hidden');
  const questions = getQuiz(quizNum);
  el.innerHTML = `
    <div class="panel open" style="margin-top:1rem">
      <div class="panel-header"><h3>📝 阶段 Quiz ${quizNum}（Day ${day}）</h3></div>
      <div class="panel-body" style="display:block">
        <p style="margin-bottom:1rem;color:var(--muted)">共 ${questions.length} 题，提交后自动打分。</p>
        <div id="quiz-questions"></div>
        <button class="btn btn-success" id="submit-quiz">提交 Quiz</button>
        <div class="feedback" id="quiz-feedback" style="margin-top:1rem"></div>
      </div>
    </div>`;

  const container = document.getElementById('quiz-questions');
  const answers = {};
  questions.forEach((q, i) => renderQuestionInto(container, q, i, answers, 'quiz'));

  document.getElementById('submit-quiz').onclick = () => {
    const db = cloneFreshDb(SQL, templateDb);
    const ans = questions.map((q, i) => {
      const editor = document.getElementById(`quiz-sql-${i}`);
      return q.type === 'sql' ? (editor ? editor.value : '') : answers[i];
    });
    const { score, total, wrong, details } = gradeSet(questions, ans, db, runQuery);
    const fb = document.getElementById('quiz-feedback');
    fb.className = 'feedback show ' + (score / total >= 0.6 ? 'correct' : 'wrong');
    fb.textContent = `Quiz 得分：${score}/${total}。${score / total >= 0.6 ? '通过！' : '建议复习后再考。'}`;
    recordQuiz(state, `quiz-${quizNum}`, score, total);
    wrong.forEach((w) => addWrong(state, { ...w, day: currentDay, setId: `quiz-${quizNum}` }));
    updateStats();
  };
}

function renderExamSection(type) {
  const el = document.getElementById('quiz-container');
  el.classList.remove('view-hidden');
  const questions = type === 'midterm' ? getMidterm() : getFinal();
  const title = type === 'midterm' ? '期中考试（Day 15 · 涵盖 Day 1–14）' : '期末考试（Day 30 · 综合）';
  el.innerHTML = `
    <div class="panel open" style="margin-top:1rem;border-color:var(--danger)">
      <div class="panel-header"><h3>🎓 ${title}</h3></div>
      <div class="panel-body" style="display:block">
        <p style="margin-bottom:1rem">共 ${questions.length} 题。建议先复习错题本。</p>
        <div id="exam-questions"></div>
        <button class="btn btn-success" id="submit-exam">提交 ${type === 'midterm' ? '期中' : '期末'}</button>
        <div class="feedback" id="exam-feedback" style="margin-top:1rem"></div>
      </div>
    </div>`;

  const container = document.getElementById('exam-questions');
  const answers = {};
  questions.forEach((q, i) => renderQuestionInto(container, q, i, answers, type));

  document.getElementById('submit-exam').onclick = () => {
    const db = cloneFreshDb(SQL, templateDb);
    const ans = questions.map((q, i) => {
      const editor = document.getElementById(`${type}-sql-${i}`);
      return q.type === 'sql' ? (editor ? editor.value : '') : answers[i];
    });
    const { score, total, wrong } = gradeSet(questions, ans, db, runQuery);
    const fb = document.getElementById('exam-feedback');
    fb.className = 'feedback show ' + (score / total >= 0.6 ? 'correct' : 'wrong');
    fb.textContent = `${type === 'midterm' ? '期中' : '期末'}得分：${score}/${total}`;
    recordExam(state, type, score, total);
    updateStats();
  };
}

function renderQuestionInto(container, q, i, answers, prefix) {
  const card = document.createElement('div');
  card.className = 'question-card';
  if (q.type === 'mcq') {
    card.innerHTML = `
      <div class="q-num"><span class="tag tag-mcq">选择</span> ${i + 1}. ${q.topic}</div>
      <div class="q-text">${escapeHtml(q.question)}</div>
      <div class="mcq-options" id="${prefix}-mcq-${i}"></div>`;
    const opts = card.querySelector(`#${prefix}-mcq-${i}`);
    q.options.forEach((opt, oi) => {
      const label = document.createElement('label');
      label.className = 'mcq-option';
      label.innerHTML = `<input type="radio" name="${prefix}q${i}" /> ${escapeHtml(opt)}`;
      label.onclick = () => {
        opts.querySelectorAll('.mcq-option').forEach((l) => l.classList.remove('selected'));
        label.classList.add('selected');
        answers[i] = oi;
      };
      opts.appendChild(label);
    });
  } else {
    card.innerHTML = `
      <div class="q-num"><span class="tag tag-sql">SQL</span> ${i + 1}. ${q.topic}</div>
      <div class="q-text">${escapeHtml(q.question)}</div>
      <textarea class="sql-editor" id="${prefix}-sql-${i}"></textarea>`;
  }
  container.appendChild(card);
}

function renderWrongBook() {
  const list = document.getElementById('wrong-list');
  const items = state.wrongBook.filter((w) => !w.mastered);
  if (!items.length) {
    list.innerHTML = '<li style="padding:1rem;color:var(--muted)">暂无错题，继续保持！</li>';
    return;
  }
  list.innerHTML = items
    .map(
      (w) => `
    <li>
      <span class="tag tag-${w.type === 'mcq' ? 'mcq' : 'sql'}">${w.type === 'mcq' ? '选择' : 'SQL'}</span>
      Day ${w.day} · ${w.topic || ''}<br/>
      <span style="color:var(--muted)">${escapeHtml((w.question || '').slice(0, 120))}</span><br/>
      <small style="color:var(--accent2)">${escapeHtml(w.explanation || '')}</small><br/>
      <button class="btn btn-sm btn-secondary" style="margin-top:0.4rem" data-id="${w.id}">标记已掌握</button>
    </li>`
    )
    .join('');

  list.querySelectorAll('button[data-id]').forEach((btn) => {
    btn.onclick = () => {
      markWrongMastered(state, btn.dataset.id);
      renderWrongBook();
      updateStats();
    };
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

boot();
