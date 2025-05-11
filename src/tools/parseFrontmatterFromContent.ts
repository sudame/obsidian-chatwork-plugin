export function parseFrontmatterFromContent(
  content: string,
): Record<string, string> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};
  const frontmatter = frontmatterMatch[1];

  if (!frontmatter) return {};

  const lines = frontmatter.split('\n');
  const result: Record<string, string> = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (key && value) {
      result[key] = value;
    }
  }

  return result;
}
