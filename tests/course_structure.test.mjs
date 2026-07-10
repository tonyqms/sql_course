import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

async function loadLessons() {
  const source = await readFile(new URL('../data/lessons.js', import.meta.url), 'utf8');
  const moduleSource = source.replace('export const LESSONS =', 'const LESSONS =');
  const script = new vm.Script(`${moduleSource}\nLESSONS;`, { filename: 'lessons.js' });
  return script.runInNewContext({});
}

test('all 30 lessons expose bilingual structured learning material', async () => {
  const lessons = await loadLessons();

  assert.equal(Object.keys(lessons).length, 30);

  for (let day = 1; day <= 30; day += 1) {
    const lesson = lessons[day];
    assert.ok(lesson, `Day ${day} is present`);
    assert.equal(typeof lesson.title.en, 'string', `Day ${day} has an English title`);
    assert.equal(typeof lesson.title.zh, 'string', `Day ${day} has a Chinese title`);
    assert.equal(typeof lesson.summary.en, 'string', `Day ${day} has an English summary`);
    assert.equal(typeof lesson.summary.zh, 'string', `Day ${day} has a Chinese summary`);
    assert.ok(lesson.concepts.length >= 3, `Day ${day} has at least 3 concepts`);

    for (const concept of lesson.concepts) {
      assert.equal(typeof concept.title.en, 'string', `Day ${day} concept has English title`);
      assert.equal(typeof concept.title.zh, 'string', `Day ${day} concept has Chinese title`);
      assert.equal(typeof concept.summary.en, 'string', `Day ${day} concept has English summary`);
      assert.equal(typeof concept.summary.zh, 'string', `Day ${day} concept has Chinese summary`);
      assert.equal(typeof concept.explanation.en, 'string', `Day ${day} concept has English explanation`);
      assert.equal(typeof concept.explanation.zh, 'string', `Day ${day} concept has Chinese explanation`);
      assert.ok(concept.checkYourself?.en || concept.checkYourself?.zh, `Day ${day} concept has a self-check prompt`);
    }
  }
});

test('app shell includes language gate and concept navigation hooks', async () => {
  const [html, appSource] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../js/app.js', import.meta.url), 'utf8'),
  ]);

  assert.match(html, /id="language-gate"/);
  assert.match(html, /data-lang="en"/);
  assert.match(html, /data-lang="zh"/);
  assert.match(appSource, /renderDailyToc/);
  assert.match(appSource, /toggleConcept/);
  assert.match(appSource, /currentLanguage/);
});

test('exercise and quiz flows expose reset controls and review-state helpers', async () => {
  const [html, appSource] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../js/app.js', import.meta.url), 'utf8'),
  ]);

  assert.match(html, /id="btn-reset-set"/);
  assert.match(appSource, /resetCurrentSet/);
  assert.match(appSource, /renderGradingReview/);
  assert.match(appSource, /resetQuizAttempt/);
  assert.match(appSource, /resetExamAttempt/);
  assert.doesNotMatch(appSource, /recordSetScore[\s\S]*renderExerciseTabs\(currentDay\)/);
});
