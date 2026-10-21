/** Pure helpers for the document checklist: progress and the copyable summary. */

type Doc = { id: number; text: string; desc: string };
export type Group = { title: string; items: Doc[] };
export type Ticks = Record<string, boolean>;
export type Files = Record<string, { name: string; size: number; uploadedAt?: string }>;

export function progress(groups: Group[], ticks: Ticks) {
  const ids = groups.flatMap((g) => g.items.map((d) => d.id));
  const done = ids.filter((id) => ticks[id]).length;
  return { done, total: ids.length, pct: ids.length ? Math.round((done / ids.length) * 100) : 0 };
}

export function summaryText(title: string, groups: Group[], ticks: Ticks, files: Files, progressLine: string): string {
  const lines = [title, ''];
  for (const g of groups) {
    lines.push(g.title);
    for (const d of g.items) {
      const file = files[d.id] ? ` (${files[d.id]!.name})` : '';
      lines.push(`  ${ticks[d.id] ? '[x]' : '[ ]'} ${d.text}${file}`);
    }
    lines.push('');
  }
  lines.push(progressLine);
  return lines.join('\n');
}

/** 1536 -> "1.5 KB", 2_400_000 -> "2.3 MB". */
export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1).replace(/\.0$/, '')} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(/\.0$/, '')} MB`;
}
