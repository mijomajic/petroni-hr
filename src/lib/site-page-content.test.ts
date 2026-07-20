import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cloneSitePageContent,
  DEFAULT_SITE_PAGES,
  isSitePageKey,
  localizedText,
  sanitizeSitePageContent
} from './site-page-content';

test('empty database content expands to the complete safe page defaults', () => {
  const home = sanitizeSitePageContent('home', {});
  assert.equal(home.sections.length, DEFAULT_SITE_PAGES.home.sections.length);
  assert.equal(home.sections[0].id, 'hero');
  assert.equal(home.sections[0].visible, true);
  assert.match(home.title.hr, /Petroni/);
});

test('admin section order and visibility are preserved while unknown sections are rejected', () => {
  const source = cloneSitePageContent(DEFAULT_SITE_PAGES.home);
  source.sections = [
    { ...source.sections[2], visible: false },
    { ...source.sections[0], visible: true },
    { id: 'unsafe', type: 'hero', label: 'Unsafe', visible: true }
  ];
  const sanitized = sanitizeSitePageContent('home', source);
  assert.deepEqual(sanitized.sections.slice(0, 2).map((section) => section.id), ['partners', 'hero']);
  assert.equal(sanitized.sections[0].visible, false);
  assert.equal(sanitized.sections.some((section) => section.id === 'unsafe'), false);
  assert.equal(sanitized.sections.length, DEFAULT_SITE_PAGES.home.sections.length);
});

test('unsafe links are replaced and new FAQ items keep validated bilingual text', () => {
  const source = cloneSitePageContent(DEFAULT_SITE_PAGES.contact);
  const contact = source.sections.find((section) => section.id === 'contact');
  const faq = source.sections.find((section) => section.id === 'faq');
  assert.ok(contact?.items && faq?.items);
  contact.items[1].href = 'javascript:alert(1)';
  faq.items.push({
    id: 'custom question',
    title: { hr: 'Novo pitanje', en: 'New question' },
    body: { hr: 'Novi odgovor', en: 'New answer' }
  });
  faq.items.push({
    id: 'custom question',
    title: { hr: 'Drugo pitanje', en: 'Second question' },
    body: { hr: 'Drugi odgovor', en: 'Second answer' }
  });
  const sanitized = sanitizeSitePageContent('contact', source);
  const sanitizedContact = sanitized.sections.find((section) => section.id === 'contact');
  const sanitizedFaq = sanitized.sections.find((section) => section.id === 'faq');
  assert.equal(sanitizedContact?.items?.[1].href, 'tel:+385912427247');
  assert.equal(sanitizedFaq?.items?.at(-2)?.id, 'custom-question');
  assert.equal(sanitizedFaq?.items?.at(-2)?.title?.en, 'New question');
  assert.equal(sanitizedFaq?.items?.at(-1)?.id, 'custom-question-2');
});

test('English content falls back to Croatian only at render time', () => {
  assert.equal(localizedText({ hr: 'Hrvatski tekst', en: '' }, 'en'), 'Hrvatski tekst');
  assert.equal(localizedText({ hr: 'Hrvatski tekst', en: 'English text' }, 'en'), 'English text');
});

test('homepage hero keeps distinct Croatian and English CMS headlines', () => {
  const hero = DEFAULT_SITE_PAGES.home.sections.find((section) => section.id === 'hero');
  assert.match(localizedText(hero?.title, 'hr'), /^Putujte bez granica/);
  assert.match(localizedText(hero?.title, 'en'), /^Travel without borders/);
});

test('only explicit CMS page keys are accepted', () => {
  assert.equal(isSitePageKey('home'), true);
  assert.equal(isSitePageKey('toString'), false);
  assert.equal(isSitePageKey('__proto__'), false);
});
