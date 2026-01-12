const parsePostId = (raw: unknown): number => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Invalid post id: ${String(raw)}`);
  return n;
};

export { parsePostId };
