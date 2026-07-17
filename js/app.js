import { initDatabase, cloneFreshDb } from './schema.js?v=5';
import { loadProgress, saveProgress, getDayProgress, recordSetScore, recordQuiz, recordExam, getStats, resetProgress, startRound2, exportReport, markWrongMastered, addWrong } from './progress.js?v=5';
import { buildRound2Order } from './dag.js?v=5';
import { gradeSet, runQuery, formatOutputContract } from './grader.js?v=5';
import { LESSONS } from '../data/lessons.js?v=5';
import { getDailySet, getQuiz, getMidterm, getFinal } from '../data/questions.js?v=5';

let SQL = null;
let templateDb = null;
let state = loadProgress();
let currentDay = state.currentDay || 1;
let currentSet = 'A';
let currentAnswers = {};
let activeQuestions = [];
let currentLanguage = localStorage.getItem('sql-learning-language') || null;

const QUIZ_DAYS = { 5: 1, 10: 2, 15: 3, 20: 4, 25: 5 };
const EXAM_DAYS = { 15: 'midterm', 30: 'final' };
const LANGUAGES = ['en', 'zh'];
const UI = {
  en: {
    appTitle: 'SQL 30-Day Interactive Course',
    subtitle: 'A local SQL learning app with bilingual concepts, practice, quizzes, and progress tracking',
    progress: 'Progress',
    streak: 'Streak',
    days: 'days',
    wrong: 'Wrong',
    round: 'Round',
    calendar: 'Learning Calendar Day 1-30',
    mobileCalendar: 'Calendar',
    wrongBook: 'Wrong Book',
    report: 'Learning Report',
    round2: 'Start Round 2 (shuffled)',
    reset: 'Reset Progress',
    minTask: 'Minimum task',
    minTaskCopy: 'finish any 1 practice set with a score of 60% or higher.',
    checkedIn: 'Checked in today',
    quizToday: 'Stage quiz today',
    midtermToday: 'Midterm exam',
    finalToday: 'Final exam',
    readingRefs: 'Reading references',
    todayGoals: 'Today\'s Goals',
    markRead: 'Mark lesson as read',
    markedRead: 'Lesson read',
    dailyToc: 'Daily Table of Contents',
    conceptMap: 'Concept Map',
    conceptDetails: 'Concept Details',
    selfCheck: 'Check yourself',
    commonPitfalls: 'Common Pitfalls',
    exercises: 'Daily Practice (3 sets, 6 questions each)',
    set: 'Set',
    mcq: 'Multiple Choice',
    sql: 'SQL',
    question: 'Question',
    editorPlaceholder: 'Type SQL here...',
    preview: 'Run preview (not graded)',
    submitSet: 'Submit and grade this set',
    resetSet: 'Reset this set',
    resetQuiz: 'Reset quiz',
    resetExam: 'Reset exam',
    finishPrompt: 'Finish questions, then submit for grading',
    score: 'Score',
    percentage: 'Percentage',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
    notAnswered: 'Not answered',
    outputContract: 'Output requirement',
    passed: 'Passed',
    reviewAgain: 'Review and try again',
    wrongBookTitle: 'Wrong Book',
    wrongBookEmpty: 'No wrong answers yet. Keep going.',
    mastered: 'Mark mastered',
    back: 'Back to learning',
    reportTitle: 'Learning Report',
    loadingEngine: 'Initializing local SQL engine...',
    loadingDb: 'Creating practice database...',
    loadFailed: 'Load failed',
    round2Already: 'You are already in Round 2.',
    round2Confirm: 'Start Round 2? Independent chapters will be shuffled and progress will be kept.',
    round2Started: 'Round 2 started. The sidebar now shows learning order.',
    resetConfirm: 'Reset all progress and wrong-book records?',
  },
  zh: {
    appTitle: 'SQL 30 天互动教程',
    subtitle: '本地运行的双语 SQL 学习网页：概念、练习、小测、错题与进度追踪',
    progress: '进度',
    streak: '连续',
    days: '天',
    wrong: '错题',
    round: '第',
    calendar: '学习日历 Day 1-30',
    mobileCalendar: '日历',
    wrongBook: '错题本',
    report: '学习报告',
    round2: '开始第 2 轮（打乱顺序）',
    reset: '重置进度',
    minTask: '今日最低任务',
    minTaskCopy: '完成任意 1 套练习且得分 >=60% 即算打卡。',
    checkedIn: '今日已打卡',
    quizToday: '今日含阶段 Quiz',
    midtermToday: '期中考试',
    finalToday: '期末考试',
    readingRefs: '阅读参考',
    todayGoals: '今日目标',
    markRead: '标记课文已读',
    markedRead: '已标记阅读',
    dailyToc: '本日目录',
    conceptMap: '概念地图',
    conceptDetails: '核心知识',
    selfCheck: '自检问题',
    commonPitfalls: '常见坑',
    exercises: '每日练习（3 套 · 每套 6 题）',
    set: '套题',
    mcq: '选择题',
    sql: 'SQL 题',
    question: '第',
    editorPlaceholder: '在此输入 SQL...',
    preview: '试运行（不记分）',
    submitSet: '提交本套并打分',
    resetSet: '重置本套',
    resetQuiz: '重置 Quiz',
    resetExam: '重置考试',
    finishPrompt: '完成题目后点击提交打分',
    score: '得分',
    percentage: '百分比',
    yourAnswer: '你的答案',
    correctAnswer: '正确答案',
    notAnswered: '未作答',
    outputContract: '输出要求',
    passed: '通过',
    reviewAgain: '建议复习后再考',
    wrongBookTitle: '错题本',
    wrongBookEmpty: '暂无错题，继续保持。',
    mastered: '标记已掌握',
    back: '返回学习',
    reportTitle: '学习报告',
    loadingEngine: '正在初始化本地 SQL 引擎...',
    loadingDb: '正在创建练习数据库...',
    loadFailed: '加载失败',
    round2Already: '已在第 2 轮学习中',
    round2Confirm: '开始第 2 轮？无依赖的章节将打乱顺序，进度保留。',
    round2Started: '第 2 轮已开始！侧边栏显示的是学习顺序。',
    resetConfirm: '确定重置所有进度、错题本？',
  },
};

async function boot() {
  try {
    document.getElementById('loading').classList.remove('hidden');
    setLoadingMessage(t('loadingEngine'));
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

    setLoadingMessage(t('loadingDb'));
    templateDb = await initDatabase(SQL);
    document.getElementById('loading').classList.add('hidden');
    bindGlobal();
    updateStaticText();
    renderSidebar();
    renderDay(currentDay);
    updateStats();
  } catch (e) {
    document.getElementById('loading').innerHTML = `<p style="color:#ef4444">${t('loadFailed')}：${e.message}<br>请通过本地 HTTP 服务器打开（见 README）。</p>`;
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
  document.querySelectorAll('[data-header-lang]').forEach((btn) => {
    btn.onclick = () => setLanguage(btn.dataset.headerLang, { rerender: true });
  });
  document.getElementById('toggle-sidebar').onclick = () => {
    document.getElementById('sidebar').classList.toggle('open');
  };
  document.getElementById('btn-wrong-book').onclick = () => showView('wrong');
  document.getElementById('btn-report').onclick = () => showReport();
  document.getElementById('btn-round2').onclick = () => {
    if (state.round >= 2) return alert(t('round2Already'));
    if (!confirm(t('round2Confirm'))) return;
    startRound2(state, buildRound2Order());
    updateStats();
    renderSidebar();
    alert(t('round2Started'));
  };
  document.getElementById('btn-reset').onclick = () => {
    if (!confirm(t('resetConfirm'))) return;
    state = resetProgress();
    currentDay = 1;
    renderSidebar();
    renderDay(1);
    updateStats();
  };
  document.getElementById('btn-back-from-wrong').onclick = () => showView('day');
  document.getElementById('btn-back-from-report').onclick = () => showView('day');
  document.getElementById('btn-submit-set').onclick = submitCurrentSet;
  document.getElementById('btn-reset-set').onclick = resetCurrentSet;
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
  document.getElementById('stat-round').textContent = currentLanguage === 'zh' ? `第 ${s.round} 轮` : `${t('round')} ${s.round}`;
}

function renderSidebar() {
  const grid = document.getElementById('day-grid');
  grid.innerHTML = '';
  const order = state.round === 2 && state.dayOrder ? state.dayOrder : Array.from({ length: 30 }, (_, i) => i + 1);

  order.forEach((day, idx) => {
    const btn = document.createElement('button');
    btn.className = 'day-btn';
    btn.textContent = state.round === 2 ? `${idx + 1}` : day;
    btn.title = `Day ${day}: ${LESSONS[day] ? localize(LESSONS[day].title) : ''}`;
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
  const title = localize(lesson.title);

  document.getElementById('min-task-banner').innerHTML =
    `⏱ ${lesson.minutes} min · <strong>${t('minTask')}</strong>: ${t('minTaskCopy')}` +
    (dp.minTaskDone ? ` <span style="color:var(--accent2)">✓ ${t('checkedIn')}</span>` : '');

  document.getElementById('day-header').innerHTML = `
    <section class="day-hero">
      <div>
        <p class="eyebrow">Day ${day}</p>
        <h2>${escapeHtml(title)}</h2>
        <p>${formatRichText(localize(lesson.summary))}</p>
      </div>
      <div class="day-flags">
        ${isQuiz ? `<span style="color:var(--warn)">${t('quizToday')}</span>` : ''}
        ${examType === 'midterm' ? `<span style="color:var(--danger)">${t('midtermToday')}</span>` : ''}
        ${examType === 'final' ? `<span style="color:var(--danger)">${t('finalToday')}</span>` : ''}
      </div>
    </section>`;

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
  const objectivesHtml = localizeList(lesson.objectives).map((o) => `<li>${formatRichText(o)}</li>`).join('');
  const conceptsHtml = lesson.concepts.map((concept, index) => renderConceptBlock(concept, index)).join('');
  const pitfallsHtml = localizeList(lesson.pitfalls).map((p) => `<li>${formatRichText(p)}</li>`).join('');

  container.innerHTML = `
    <div class="panel open" id="panel-objectives">
      <div class="panel-header" onclick="togglePanel('panel-objectives')">
        <h3>${t('todayGoals')}</h3><span class="chevron">▼</span>
      </div>
      <div class="panel-body" style="display:block">
        <ul class="objectives">${objectivesHtml}</ul>
        <button class="btn btn-secondary btn-sm" id="mark-read">${dp.lessonRead ? `✓ ${t('markedRead')}` : t('markRead')}</button>
      </div>
    </div>
    ${renderDailyToc(lesson)}
    <div class="panel open" id="panel-concepts">
      <div class="panel-header" onclick="togglePanel('panel-concepts')">
        <h3>${t('conceptDetails')}</h3><span class="chevron">▼</span>
      </div>
      <div class="panel-body" style="display:block">
        ${conceptsHtml}
        <div class="reading-refs"><strong>${t('readingRefs')}：</strong>${lesson.readingRefs.map((r) => `<span>${escapeHtml(r)}</span>`).join('')}</div>
      </div>
    </div>
    <div class="panel" id="panel-pitfalls">
      <div class="panel-header" onclick="togglePanel('panel-pitfalls')">
        <h3>${t('commonPitfalls')}</h3><span class="chevron">▼</span>
      </div>
      <div class="panel-body">
        <ul class="objectives">${pitfallsHtml}</ul>
      </div>
    </div>`;

  document.getElementById('mark-read').onclick = (e) => {
    dp.lessonRead = true;
    saveProgress(state);
    e.target.textContent = `✓ ${t('markedRead')}`;
  };
}

function renderDailyToc(lesson) {
  return `
    <nav class="panel day-toc-panel" aria-label="${t('dailyToc')}">
      <div class="panel-header no-toggle">
        <h3>${t('dailyToc')}</h3>
      </div>
      <div class="panel-body toc-body" style="display:block">
        <div class="toc-links">
          ${lesson.concepts
            .map(
              (concept, index) => `
                <a href="#concept-${index + 1}" class="toc-link">
                  <span>${index + 1}</span>
                  ${escapeHtml(localize(concept.title))}
                </a>`
            )
            .join('')}
        </div>
      </div>
    </nav>`;
}

function renderConceptBlock(concept, index) {
  const number = index + 1;
  return `
    <article class="concept-block concept-open" id="concept-${number}">
      <button class="concept-toggle" type="button" onclick="toggleConcept('concept-${number}')">
        <span class="concept-number">${number}</span>
        <span>
          <strong>${escapeHtml(localize(concept.title))}</strong>
          <small>${formatRichText(localize(concept.summary))}</small>
        </span>
        <span class="chevron">▼</span>
      </button>
      <div class="concept-body">
        <p>${formatRichText(localize(concept.explanation))}</p>
        ${concept.code ? `<pre>${escapeHtml(concept.code)}</pre>` : ''}
        <div class="self-check"><strong>${t('selfCheck')}:</strong> ${formatRichText(localize(concept.checkYourself))}</div>
      </div>
    </article>`;
}

window.togglePanel = function (id) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
  const body = el.querySelector('.panel-body');
  body.style.display = el.classList.contains('open') ? 'block' : 'none';
};

window.toggleConcept = function (id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('concept-open');
};

function renderExerciseTabs(day) {
  const tabs = document.getElementById('exercise-tabs');
  tabs.innerHTML = '';
  ['A', 'B', 'C'].forEach((setId) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (setId === currentSet ? ' active' : '');
    const sc = state.days[day] && state.days[day].sets ? state.days[day].sets[setId] : null;
    btn.textContent = `${t('set')} ${setId}` + (sc ? ` (${sc.score}/${sc.total})` : '');
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
        <div class="q-num"><span class="tag tag-mcq">${t('mcq')}</span> ${t('question')} ${i + 1} · ${q.topic}</div>
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
        <div class="q-num"><span class="tag tag-sql">${t('sql')}</span> ${t('question')} ${i + 1} · ${q.topic}</div>
        <div class="q-text">${escapeHtml(q.question)}</div>
        ${renderOutputContract(q)}
        <textarea class="sql-editor" id="sql-${i}" placeholder="${t('editorPlaceholder')}"></textarea>
        <button class="btn btn-secondary btn-sm" style="margin-top:0.5rem" onclick="runPreview(${i})">▶ ${t('preview')}</button>
        <div class="feedback" id="fb-${i}"></div>
        <pre id="preview-${i}" style="display:none;margin-top:0.5rem;font-size:0.75rem;max-height:120px;overflow:auto"></pre>`;
    }
    container.appendChild(card);
  });

  document.getElementById('score-bar').style.display = 'flex';
  document.getElementById('score-text').textContent = t('finishPrompt');
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

  renderGradingReview(activeQuestions, currentAnswers, details, '');
  recordSetScore(state, currentDay, currentSet, score, total, wrong);
  document.getElementById('score-text').textContent = formatScore(score, total);
  updateStats();
  renderSidebar();
}

function resetCurrentSet() {
  currentAnswers = {};
  loadQuestionSet(currentDay, currentSet);
}

function renderGradingReview(questions, answers, details, prefix) {
  details.forEach((detail, i) => {
    const question = questions[i];
    const fb = document.getElementById(`${prefix}fb-${i}`);
    if (!fb) return;
    fb.className = 'feedback show ' + (detail.correct ? 'correct' : 'wrong');
    fb.innerHTML = buildFeedbackHtml(question, answers[i], detail);

    if (question.type === 'mcq') {
      const card = fb.closest('.question-card');
      card.querySelectorAll('.mcq-option').forEach((opt, oi) => {
        opt.classList.remove('correct', 'wrong');
        if (oi === question.answer) opt.classList.add('correct');
        else if (oi === answers[i]) opt.classList.add('wrong');
      });
    }
  });
}

function buildFeedbackHtml(question, answer, detail) {
  const answerText = question.type === 'mcq'
    ? (answer == null ? t('notAnswered') : question.options[answer])
    : (answer && answer.trim() ? answer.trim() : t('notAnswered'));
  const correctText = question.type === 'mcq' ? question.options[question.answer] : (question.expectedSql || question.answerSql || '');
  return `
    <div>${escapeHtml(detail.feedback)}</div>
    <div class="answer-review"><strong>${t('yourAnswer')}:</strong> <code>${escapeHtml(answerText)}</code></div>
    <div class="answer-review"><strong>${t('correctAnswer')}:</strong> <code>${escapeHtml(correctText)}</code></div>`;
}

function formatScore(score, total) {
  const percentage = total ? Math.round((score / total) * 100) : 0;
  return `${t('score')}: ${score} / ${total} · ${t('percentage')}: ${percentage}%`;
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
        <div class="score-actions">
          <button class="btn btn-secondary" id="reset-quiz">${t('resetQuiz')}</button>
          <button class="btn btn-success" id="submit-quiz">提交 Quiz</button>
        </div>
        <div class="feedback" id="quiz-feedback" style="margin-top:1rem"></div>
      </div>
    </div>`;

  const container = document.getElementById('quiz-questions');
  const answers = {};
  questions.forEach((q, i) => renderQuestionInto(container, q, i, answers, 'quiz'));

  document.getElementById('reset-quiz').onclick = () => resetQuizAttempt(day, quizNum);
  document.getElementById('submit-quiz').onclick = () => {
    const db = cloneFreshDb(SQL, templateDb);
    const ans = questions.map((q, i) => {
      const editor = document.getElementById(`quiz-sql-${i}`);
      return q.type === 'sql' ? (editor ? editor.value : '') : answers[i];
    });
    const { score, total, wrong, details } = gradeSet(questions, ans, db, runQuery);
    renderGradingReview(questions, ans, details, 'quiz-');
    const fb = document.getElementById('quiz-feedback');
    fb.className = 'feedback show ' + (score / total >= 0.6 ? 'correct' : 'wrong');
    fb.textContent = `${formatScore(score, total)}. ${score / total >= 0.6 ? `${t('passed')}!` : `${t('reviewAgain')}.`}`;
    recordQuiz(state, `quiz-${quizNum}`, score, total);
    wrong.forEach((w) => addWrong(state, { ...w, day: currentDay, setId: `quiz-${quizNum}` }));
    updateStats();
  };
}

function resetQuizAttempt(day, quizNum) {
  renderQuizSection(day, quizNum);
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
        <div class="score-actions">
          <button class="btn btn-secondary" id="reset-exam">${t('resetExam')}</button>
          <button class="btn btn-success" id="submit-exam">提交 ${type === 'midterm' ? '期中' : '期末'}</button>
        </div>
        <div class="feedback" id="exam-feedback" style="margin-top:1rem"></div>
      </div>
    </div>`;

  const container = document.getElementById('exam-questions');
  const answers = {};
  questions.forEach((q, i) => renderQuestionInto(container, q, i, answers, type));

  document.getElementById('reset-exam').onclick = () => resetExamAttempt(type);
  document.getElementById('submit-exam').onclick = () => {
    const db = cloneFreshDb(SQL, templateDb);
    const ans = questions.map((q, i) => {
      const editor = document.getElementById(`${type}-sql-${i}`);
      return q.type === 'sql' ? (editor ? editor.value : '') : answers[i];
    });
    const { score, total, details } = gradeSet(questions, ans, db, runQuery);
    renderGradingReview(questions, ans, details, `${type}-`);
    const fb = document.getElementById('exam-feedback');
    fb.className = 'feedback show ' + (score / total >= 0.6 ? 'correct' : 'wrong');
    fb.textContent = `${type === 'midterm' ? '期中' : '期末'}${formatScore(score, total)}`;
    recordExam(state, type, score, total);
    updateStats();
  };
}

function resetExamAttempt(type) {
  renderExamSection(type);
}

function renderQuestionInto(container, q, i, answers, prefix) {
  const card = document.createElement('div');
  card.className = 'question-card';
  if (q.type === 'mcq') {
    card.innerHTML = `
      <div class="q-num"><span class="tag tag-mcq">${t('mcq')}</span> ${i + 1}. ${q.topic}</div>
      <div class="q-text">${escapeHtml(q.question)}</div>
      <div class="mcq-options" id="${prefix}-mcq-${i}"></div>
      <div class="feedback" id="${prefix}-fb-${i}"></div>`;
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
      <div class="q-num"><span class="tag tag-sql">${t('sql')}</span> ${i + 1}. ${q.topic}</div>
      <div class="q-text">${escapeHtml(q.question)}</div>
      ${renderOutputContract(q)}
      <textarea class="sql-editor" id="${prefix}-sql-${i}" placeholder="${t('editorPlaceholder')}"></textarea>
      <div class="feedback" id="${prefix}-fb-${i}"></div>`;
  }
  container.appendChild(card);
}

function renderWrongBook() {
  const list = document.getElementById('wrong-list');
  const items = state.wrongBook.filter((w) => !w.mastered);
  if (!items.length) {
    list.innerHTML = `<li style="padding:1rem;color:var(--muted)">${t('wrongBookEmpty')}</li>`;
    return;
  }
  list.innerHTML = items
    .map(
      (w) => `
    <li>
      <span class="tag tag-${w.type === 'mcq' ? 'mcq' : 'sql'}">${w.type === 'mcq' ? t('mcq') : t('sql')}</span>
      Day ${w.day} · ${w.topic || ''}<br/>
      <span style="color:var(--muted)">${escapeHtml((w.question || '').slice(0, 120))}</span><br/>
      <small style="color:var(--accent2)">${escapeHtml(w.explanation || '')}</small><br/>
      <button class="btn btn-sm btn-secondary" style="margin-top:0.4rem" data-id="${w.id}">${t('mastered')}</button>
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

function initLanguageGate() {
  const gate = document.getElementById('language-gate');
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.onclick = () => {
      setLanguage(btn.dataset.lang, { rerender: false });
      gate.classList.add('hidden');
      boot();
    };
  });

  if (LANGUAGES.includes(currentLanguage)) {
    gate.classList.add('hidden');
    boot();
  } else {
    document.getElementById('loading').classList.add('hidden');
    gate.classList.remove('hidden');
  }
}

function setLanguage(lang, options = { rerender: true }) {
  if (!LANGUAGES.includes(lang)) return;
  currentLanguage = lang;
  localStorage.setItem('sql-learning-language', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  updateStaticText();
  if (options.rerender && templateDb) {
    renderSidebar();
    renderDay(currentDay);
    updateStats();
    showView('day');
  }
}

function updateStaticText() {
  if (!currentLanguage) return;
  setText('app-title', t('appTitle'));
  setText('app-subtitle', t('subtitle'));
  setText('sidebar-title', t('calendar'));
  setText('toggle-sidebar', `☰ ${t('mobileCalendar')}`);
  setText('btn-wrong-book', t('wrongBook'));
  setText('btn-report', t('report'));
  setText('btn-round2', t('round2'));
  setText('btn-reset', `↺ ${t('reset')}`);
  setText('exercise-title', t('exercises'));
  setText('btn-submit-set', t('submitSet'));
  setText('btn-reset-set', t('resetSet'));
  setText('wrong-title', t('wrongBookTitle'));
  setText('wrong-help', currentLanguage === 'zh' ? '做错的题目会自动收录。标记「已掌握」后移出活跃列表。' : 'Missed questions are collected automatically. Mark them mastered to remove them from the active list.');
  setText('btn-back-from-wrong', `← ${t('back')}`);
  setText('report-title', t('reportTitle'));
  setText('btn-back-from-report', `← ${t('back')}`);
  document.querySelectorAll('[data-header-lang]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.headerLang === currentLanguage);
  });
  const statLabels = document.querySelectorAll('[data-stat-label]');
  statLabels.forEach((label) => {
    label.textContent = t(label.dataset.statLabel);
  });
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function t(key) {
  return UI[currentLanguage || 'zh'][key] || UI.zh[key] || key;
}

function localize(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[currentLanguage] || value.zh || value.en || '';
}

function localizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value[currentLanguage] || value.zh || value.en || [];
}

function formatRichText(value) {
  return escapeHtml(localize(value))
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function renderOutputContract(q) {
  if (q.type !== 'sql' || q.validateBy === 'contains') return '';
  const expectedSql = q.expectedSql || q.answerSql || '';
  if (!/^\s*(WITH|SELECT)\b/i.test(expectedSql)) return '';
  const raw = formatOutputContract(expectedSql, q.columnMode || 'exact');
  if (!raw) return '';
  let detail = raw.replace(/^输出要求：/, '');
  if (currentLanguage === 'en') {
    detail = detail
      .replace(/^只返回列/, 'return only columns')
      .replace(/^至少包含列/, 'include at least columns');
  }
  return `<div class="output-contract"><strong>${t('outputContract')}:</strong> ${escapeHtml(detail)}</div>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

initLanguageGate();
