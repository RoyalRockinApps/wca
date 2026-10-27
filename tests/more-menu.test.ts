/** src/site/moreMenu.ts: the More tab's menu, shaped from the website's. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moreMenu } from '../src/site/moreMenu';
import site from '../content/site/site.json';

test('Quick Links first, then the website menu in its order', () => {
  const menu = moreMenu(site.navigation, site.footer);
  assert.equal(menu[0].label, 'Quick Links');
  assert.ok(menu[0].items!.some((l) => /Hub/.test(l.label)), 'the Westminster Hub portal is a quick link');
  assert.deepEqual(menu.slice(1).map((n) => n.label), site.navigation.map((n) => n.label));
  assert.ok(menu.some((n) => n.label === 'About Us' && n.items!.some((i) => i.label === 'Our Story')));
});

test('no Quick Links section when the footer has none', () => {
  const menu = moreMenu([{ label: 'About', url: 'https://wca-hsv.org/about/' }], { actions: [], quickLinks: [] });
  assert.deepEqual(menu.map((n) => n.label), ['About']);
});
