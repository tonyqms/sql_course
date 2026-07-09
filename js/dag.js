/**
 * Dependency graph for Round 2 shuffle.
 * Days in the same group can be reordered; edges enforce prerequisites.
 */

export const DAY_META = {
  1: { group: 'intro', deps: [] },
  2: { group: 'select', deps: [1] },
  3: { group: 'filter', deps: [2] },
  4: { group: 'sort', deps: [2] },
  5: { group: 'null-like', deps: [3, 4] },
  6: { group: 'types', deps: [2] },
  7: { group: 'dml', deps: [1] },
  8: { group: 'ddl', deps: [7] },
  9: { group: 'keys', deps: [8] },
  10: { group: 'multi-table-intro', deps: [2] },
  11: { group: 'join-inner', deps: [10] },
  12: { group: 'join-outer', deps: [11] },
  13: { group: 'join-adv', deps: [12] },
  14: { group: 'subquery', deps: [11] },
  15: { group: 'groupby', deps: [2, 3] },
  16: { group: 'groupby-deep', deps: [15] },
  17: { group: 'having', deps: [16] },
  18: { group: 'aggregate', deps: [15] },
  19: { group: 'case', deps: [2] },
  20: { group: 'strings', deps: [2] },
  21: { group: 'dates', deps: [2] },
  22: { group: 'set-ops', deps: [11] },
  23: { group: 'window', deps: [14, 16] },
  24: { group: 'cte', deps: [14] },
  25: { group: 'indexes', deps: [8] },
  26: { group: 'views', deps: [8, 14] },
  27: { group: 'transactions', deps: [7] },
  28: { group: 'import-export', deps: [7, 8] },
  29: { group: 'review', deps: [1] },
  30: { group: 'final-prep', deps: [1] },
};

/** Groups that may shuffle relative order in Round 2 (no cross-deps within group) */
export const SHUFFLE_GROUPS = [
  ['strings', 'dates', 'case'],
  ['indexes', 'views', 'transactions', 'import-export'],
];

export function buildRound2Order(rng = Math.random) {
  const order = [];
  const placed = new Set();

  function canPlace(day) {
    return DAY_META[day].deps.every((d) => placed.has(d));
  }

  const shuffleBlocks = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14],
    [15, 16, 17, 18],
    shuffleGroupDays(['case', 'strings', 'dates'], rng),
    [22, 23, 24],
    shuffleGroupDays(['indexes', 'views', 'transactions', 'import-export'], rng),
    [29, 30],
  ].flat();

  const queue = [...new Set(shuffleBlocks)];
  const result = [];
  let guard = 0;
  while (result.length < 30 && guard < 500) {
    guard++;
    for (const day of queue) {
      if (placed.has(day)) continue;
      if (canPlace(day)) {
        result.push(day);
        placed.add(day);
      }
    }
  }
  for (let d = 1; d <= 30; d++) {
    if (!placed.has(d)) result.push(d);
  }
  return result;
}

function shuffleGroupDays(groups, rng) {
  const days = Object.entries(DAY_META)
    .filter(([, m]) => groups.includes(m.group))
    .map(([d]) => +d);
  return shuffle(days, rng);
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getDisplayDayNumber(state, calendarDay) {
  if (state.round === 1 || !state.dayOrder) return calendarDay;
  return state.dayOrder.indexOf(calendarDay) + 1 || calendarDay;
}
