/** src/site/faq.ts: the home page's F.A.Q.s move from the Planner tab (then called Info) to Ask the School. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { faqSection, isFaqSection } from '../src/site/faq';
import type { Section } from '../src/site/types';

const home = JSON.parse(readFileSync(join(__dirname, '../content/site/home.json'), 'utf8')) as { sections: Section[] };

test('the WCA home page has no F.A.Q.s section, so Ask the School shows none', () => {
  assert.equal(home.sections.filter(isFaqSection).length, 0);
  assert.equal(faqSection(home.sections), null);
});

test('an F.A.Q.s section, if the site adds one, loses its heading and photo in Ask the School', () => {
  const sections: Section[] = [{ blocks: [
    { type: 'heading', level: 2, text: 'F.A.Q.s' }, { type: 'image', src: 'x.jpg' },
    { type: 'accordion', items: [{ title: 'What does tuition include?', blocks: [] }] },
    { type: 'button', label: 'Contact Us', url: 'https://wca-hsv.org/' },
  ] }];
  const faq = faqSection(sections)!;
  assert.deepEqual(faq.blocks.map((b) => b.type), ['accordion', 'button']);
});

test('headings like "FAQ" and "F.A.Q.s" both count; other headings do not', () => {
  const sec = (text: string): Section => ({ blocks: [{ type: 'heading', level: 2, text }] });
  assert.ok(isFaqSection(sec('F.A.Q.s')));
  assert.ok(isFaqSection(sec('FAQ')));
  assert.ok(!isFaqSection(sec('Fine Arts')));
  assert.equal(faqSection([sec('Our Story')]), null);
});
