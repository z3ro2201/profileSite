export function toBase64Url(bytes: Uint8Array): string {
  // Node(Next.js 서버)에서는 Buffer 사용 가능
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function fromBase64Url(b64url: string): Uint8Array {
  const pad = b64url.length % 4 ? "=".repeat(4 - (b64url.length % 4)) : "";
  const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  return new Uint8Array(Buffer.from(b64, "base64"));
}
