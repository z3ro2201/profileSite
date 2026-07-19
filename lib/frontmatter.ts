export type ParsedFrontmatter = {
  data: Record<string, string | string[]>;
  body: string;
};

const parseFrontmatterLines = (lines: string[]): Record<string, string | string[]> => {
  const data: Record<string, string | string[]> = {};
  for (const line of lines) {
    const lineMatch = line.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/);
    if (!lineMatch) continue;
    const [, key, rawValue] = lineMatch;
    const value = rawValue.trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      // tags: [a, b, c]
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      // "value" 또는 value — 앞뒤 따옴표만 벗김
      data[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return data;
};

/**
 * "---\nkey: value\n---\n본문" 형태의 프론트매터를 파싱.
 * 완전한 YAML 스펙을 다 지원하진 않고, 블로그 글쓰기용으로 흔히 쓰는
 * key: value / key: "value" / key: [a, b, c] 정도만 처리함.
 *
 * ---로 감싸져 있으면 정확히 그 블록만 프론트매터로 보고,
 * ---가 없으면(복사할 때 여는 구분선을 빼먹는 경우가 흔해서) 맨 앞부터
 * 연속으로 나오는 "key: value" 줄들을 프론트매터로 간주해서 처리한다.
 */
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const trimmed = raw.replace(/^\uFEFF/, "").trimStart(); // BOM 제거

  // 1) --- ... --- 로 명시적으로 감싸진 경우
  const fencedMatch = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (fencedMatch) {
    const [, frontmatterBlock, body] = fencedMatch;
    return {
      data: parseFrontmatterLines(frontmatterBlock.split(/\r?\n/)),
      body: body.replace(/^\r?\n/, ""),
    };
  }

  // 2) ---가 없는 경우: 맨 앞부터 연속되는 "key: value" 줄만 프론트매터로 간주
  const lines = trimmed.split(/\r?\n/);
  let cut = 0;
  while (cut < lines.length && /^([a-zA-Z_][\w-]*)\s*:\s*.*$/.test(lines[cut])) {
    cut++;
  }
  if (cut === 0) return { data: {}, body: raw };

  const frontmatterLines = lines.slice(0, cut);
  const body = lines
    .slice(cut)
    .join("\n")
    .replace(/^\r?\n+/, ""); // 프론트매터 뒤 빈 줄 정리

  return { data: parseFrontmatterLines(frontmatterLines), body };
}
