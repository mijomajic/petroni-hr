const markdownChars = /([\\`*_{}\[\]()#+\-.!|>])/g;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function inlineMarkup(value: string): string {
  let html = escapeHtml(value);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return html;
}

function listType(line: string): 'ul' | 'ol' | null {
  if (/^\s*(?:[-*•✓])\s+/.test(line)) return 'ul';
  if (/^\s*\d+[.)]\s+/.test(line)) return 'ol';
  return null;
}

function listText(line: string): string {
  return line.replace(/^\s*(?:[-*•✓]|\d+[.)])\s+/, '').trim();
}

function isSectionHeading(line: string): boolean {
  return /^✓?\s*\d+\.\s*\S/.test(line) || /^[A-ZČĆŽŠĐ0-9\s,.'&()/-]{12,}$/.test(line);
}

export function escapeMarkdown(value: string): string {
  return value.replace(markdownChars, '\\$1');
}

export function renderTermsMarkup(source: string | null | undefined): string {
  const lines = String(source ?? '').replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let list: 'ul' | 'ol' | null = null;

  function closeList() {
    if (!list) return;
    html.push(`</${list}>`);
    list = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = Math.min(heading[1].length + 1, 4);
      html.push(`<h${level}>${inlineMarkup(heading[2])}</h${level}>`);
      continue;
    }

    const type = listType(line);
    if (type) {
      if (list !== type) {
        closeList();
        list = type;
        html.push(`<${list}>`);
      }
      html.push(`<li>${inlineMarkup(listText(line))}</li>`);
      continue;
    }

    closeList();
    if (isSectionHeading(line)) {
      html.push(`<h3>${inlineMarkup(line)}</h3>`);
    } else {
      html.push(`<p>${inlineMarkup(line)}</p>`);
    }
  }

  closeList();
  return html.join('\n');
}
