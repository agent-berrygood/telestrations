import test from 'node:test';
import assert from 'node:assert/strict';
import { SECTIONS, createGame, draw, undo, remaining, lookup, restore } from '../public/game.js';

test('60 unique words in 6 sections of 10', () => {
  assert.equal(SECTIONS.length, 6);
  const all = SECTIONS.flatMap(s => { assert.equal(s.words.length, 10); return s.words; });
  assert.equal(new Set(all).size, 60);
});
test('draw removes the word and respects the section', () => {
  const s = draw(createGame(), 3, () => 0);
  assert.equal(lookup(s.current).sectionName, '속담');
  assert.equal(remaining(s, 3).length, 9);
  assert.equal(remaining(s).length, 59);
});
test('all 60 words can be drawn once, then draw rejects', () => {
  let s = createGame();
  for (let i = 0; i < 60; i++) s = draw(s);
  assert.equal(new Set(s.draws).size, 60);
  assert.throws(() => draw(s));
});
test('exhausted section rejects but others still work', () => {
  let s = createGame();
  for (let i = 0; i < 10; i++) s = draw(s, 0);
  assert.throws(() => draw(s, 0));
  assert.doesNotThrow(() => draw(s, 1));
});
test('undo restores the last word', () => {
  const s = undo(draw(createGame(), 1, () => 2));
  assert.equal(remaining(s).length, 60);
  assert.equal(s.current, null);
});
test('restore round-trips and rejects corrupt data', () => {
  const s = draw(draw(createGame()), 2);
  assert.deepEqual(restore(JSON.stringify(s)), s);
  assert.throws(() => restore(JSON.stringify({ version: 1, draws: ['0:0', '0:0'], current: '0:0' })));
  assert.throws(() => restore(JSON.stringify({ version: 1, draws: ['9:9'], current: '9:9' })));
  assert.throws(() => restore('not json'));
});
