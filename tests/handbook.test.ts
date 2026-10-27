/** src/handbook/handbook.ts: the Handbook reader's pages, paragraphs and search. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAGES, parsePages, search, toBlocks } from '../src/handbook/handbook';

const SAMPLE = parsePages(['[Page 1]', 'Family Handbook', '', '[Page 7]', 'Attendance',
  'Email attendance@wca-hsv.org by 8:00 a.m. when your child will be absent from school today.', '',
  '[Page 9]', 'Lower Campus K3-K5 dismissal is at 2:45 p.m.'].join('\n'));

test('pages are numbered like the PDF; WCA has no handbook imported yet', () => {
  assert.equal(PAGES.length, 0);
  assert.deepEqual(SAMPLE.map((p) => p.page), [1, 7, 9]);
  assert.equal(parsePages('[Page 3]\nHello\n\n[Page 4]\nWorld').map((p) => p.page).join(','), '3,4');
});

test('wrapped lines become paragraphs; short title lines become headings; the printed page number goes', () => {
  const blocks = toBlocks([
    'SCHOOL LIFE & DECORUM',
    'Attendance',
    'Classical education is highly interactive and requires consistent and punctual attendance. Because',
    'the classical approach relies heavily on classroom discussion.',
    'Excused Absences',
    'Court appearances',
    '6',
  ].join('\n'));
  assert.deepEqual(blocks.map((b) => b.kind), ['heading', 'heading', 'text', 'heading', 'text'], 'a list item stays text');
  assert.match(blocks[2].text, /punctual attendance\. Because the classical approach/);
  assert.ok(!blocks.some((b) => b.text === '6'));
  assert.deepEqual(toBlocks('256.210.1343\nWestminster').map((b) => b.kind), ['text', 'heading'], 'numbers alone are not headings');
  const joined = toBlocks([
    'Early Drop Off and Late Pick Up',
    'Students may not be dropped off before 7:40am and must be picked up by 3:15pm. The late fee is $2 per',
    'minute thereafter.',
    'Uniform and Personal Appearance',
  ].join('\n'));
  assert.deepEqual(joined.map((b) => b.kind), ['heading', 'text', 'heading'], 'short joining words; a heading after a finished sentence');
});

test('search finds text on any page, ignoring case, with context', () => {
  const m = search(SAMPLE, 'ATTENDANCE@WCA-HSV');
  assert.ok(m.length >= 1);
  assert.ok(m.every((x) => x.hit.toLowerCase() === 'attendance@wca-hsv'));
  assert.ok(m.some((x) => x.page === 7));
  assert.ok(m[0].before.length > 0 && m[0].after.length > 0);
});

test('search treats symbols as plain text and ignores one-letter searches', () => {
  assert.deepEqual(search(SAMPLE, 'a'), []);
  assert.doesNotThrow(() => search(SAMPLE, '(K3'));
  assert.ok(search(SAMPLE, 'K3-K5').length > 0);
  assert.deepEqual(search(SAMPLE, 'zzqx-not-in-handbook'), []);
});
