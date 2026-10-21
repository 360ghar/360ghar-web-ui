/** Copy and share helpers. They return the outcome; the caller shows its own toast. */

/** Copies text. Falls back to execCommand when the Clipboard API is blocked. False when both fail. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand('copy');
    input.remove();
    return ok;
  }
}

/** Opens the share sheet when there is one, else copies the link. A cancelled sheet also copies. */
export async function shareUrl({ title, url }: { title: string; url: string }): Promise<'shared' | 'copied' | 'failed'> {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return 'shared';
    } catch {
      // Cancelled: fall through to copy.
    }
  }
  return (await copyText(url)) ? 'copied' : 'failed';
}
