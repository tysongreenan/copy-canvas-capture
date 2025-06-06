export function preprocessSearchText(text: string): string[] {
  if (!text) return [];

  const variants: string[] = [];
  const cleaned = text.toLowerCase().trim();

  variants.push(cleaned);
  variants.push(cleaned.replace(/^(the|a|an)\s+/i, ''));

  const words = cleaned.split(/\s+/).filter((w) => w.length > 2);
  variants.push(...words);

  if (words.length > 1) {
    variants.push(words.join(' '));
    variants.push(words.join(''));
  }

  return [...new Set(variants)];
}

export function createSearchQueries(originalQuery: string): string[] {
  const queries = [originalQuery];
  const lowerQuery = originalQuery.toLowerCase().trim();

  if (lowerQuery.includes('junction')) {
    queries.push('Junction Stouffville development project');
    queries.push('Junction mixed-use development');
    queries.push('Stouffville Junction real estate');
    queries.push('Junction community project');
  }

  if (lowerQuery.match(/^(what is|tell me about|describe)\s+/)) {
    const subject = lowerQuery.replace(/^(what is|tell me about|describe)\s+/, '');
    queries.push(subject);
    queries.push(`${subject} project`);
    queries.push(`${subject} development`);
  }

  const listPattern = /^(?:list|overview)(?: of)?\s+(.*)$/i;
  const summaryPattern = /^summary of\s+(.*)$/i;
  const detailsPattern = /^(?:project details|details)(?: for| of)?\s+(.*)$/i;

  const match =
    lowerQuery.match(listPattern) ||
    lowerQuery.match(summaryPattern) ||
    lowerQuery.match(detailsPattern);
  if (match) {
    const subject = match[1].trim();
    queries.push(subject);
    queries.push(`${subject} project`);
    queries.push(`${subject} projects`);
    const words = subject.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      for (let i = 2; i <= words.length; i++) {
        queries.push(words.slice(0, i).join(' '));
      }
    }
    queries.push(...preprocessSearchText(subject));
  }

  queries.push(...preprocessSearchText(originalQuery));
  return [...new Set(queries)];
}
