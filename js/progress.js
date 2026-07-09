const STORAGE_KEY = 'sql-learning-mvp-v1';

const defaultState = () => ({
  round: 1,
  dayOrder: null,
  currentDay: 1,
  startedAt: new Date().toISOString(),
  days: {},
  wrongBook: [],
  quizScores: {},
  midtermScores: [],
  finalScores: [],
  lastVisit: null,
});

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) {
    return defaultState();
  }
}

export function saveProgress(state) {
  state.lastVisit = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getDayProgress(state, day) {
  if (!state.days[day]) {
    state.days[day] = {
      lessonRead: false,
      sets: { A: null, B: null, C: null },
      minTaskDone: false,
      completed: false,
    };
  }
  return state.days[day];
}

export function recordSetScore(state, day, setId, score, total, wrongItems) {
  const dp = getDayProgress(state, day);
  dp.sets[setId] = { score, total, at: new Date().toISOString() };
  if (score / total >= 0.6) dp.minTaskDone = true;
  if (['A', 'B', 'C'].every((s) => dp.sets[s] && dp.sets[s].score / dp.sets[s].total >= 0.6)) {
    dp.completed = true;
  }
  wrongItems.forEach((w) => addWrong(state, { ...w, day, setId }));
  saveProgress(state);
}

export function addWrong(state, item) {
  const exists = state.wrongBook.find((w) => w.id === item.id && w.day === item.day);
  if (exists) {
    exists.attempts = (exists.attempts || 1) + 1;
    exists.lastAt = new Date().toISOString();
  } else {
    state.wrongBook.unshift({
      ...item,
      attempts: 1,
      addedAt: new Date().toISOString(),
      mastered: false,
    });
  }
  if (state.wrongBook.length > 200) state.wrongBook = state.wrongBook.slice(0, 200);
  saveProgress(state);
}

export function markWrongMastered(state, id) {
  const item = state.wrongBook.find((w) => w.id === id);
  if (item) item.mastered = true;
  saveProgress(state);
}

export function recordQuiz(state, quizId, score, total) {
  state.quizScores[quizId] = { score, total, at: new Date().toISOString() };
  saveProgress(state);
}

export function recordExam(state, type, score, total) {
  const entry = { score, total, at: new Date().toISOString() };
  if (type === 'midterm') state.midtermScores.push(entry);
  if (type === 'final') state.finalScores.push(entry);
  saveProgress(state);
}

export function getStats(state) {
  const completed = Object.values(state.days).filter((d) => d.completed).length;
  const wrongActive = state.wrongBook.filter((w) => !w.mastered).length;
  const streak = computeStreak(state);
  return { completed, wrongActive, streak, round: state.round };
}

function computeStreak(state) {
  let streak = 0;
  for (let d = 1; d <= 30; d++) {
    const dp = state.days[d];
    if (dp && (dp.completed || dp.minTaskDone)) streak++;
    else break;
  }
  return streak;
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return defaultState();
}

export function startRound2(state, shuffledOrder) {
  state.round = 2;
  state.dayOrder = shuffledOrder;
  saveProgress(state);
}

export function exportReport(state) {
  const weak = state.wrongBook
    .filter((w) => !w.mastered)
    .slice(0, 15)
    .map((w) => ({ day: w.day, topic: w.topic || '', question: w.question ? w.question.slice(0, 80) : '' }));
  return {
    round: state.round,
    completedDays: Object.values(state.days).filter((d) => d.completed).length,
    streak: computeStreak(state),
    quizScores: state.quizScores,
    midterm: state.midtermScores,
    final: state.finalScores,
    weakPoints: weak,
    exportedAt: new Date().toISOString(),
  };
}
