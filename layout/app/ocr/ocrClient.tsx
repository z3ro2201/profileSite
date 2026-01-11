"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

type OcrOk = { ok: true; lang: string; text: string; psm?: string; preprocessed?: boolean };
type OcrFail = { ok: false; message: string };
type OcrRes = OcrOk | OcrFail;

const isFail = (v: OcrRes): v is OcrFail => v.ok === false;

const OcrClient = () => {
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState<string>("kor+eng+jpn");
  const [psm, setPsm] = useState<string>("6");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const submit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setText("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("lang", lang);
      fd.append("psm", psm);

      const json = await apiFetch<OcrRes>("/app/ocr", {
        method: "POST",
        body: fd,
      });

      if (isFail(json)) throw new Error(json.message);

      setText(json.text ?? "");
    } catch (e: any) {
      setError(e?.message ?? "OCR 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-col">
        <label
          htmlFor="txtFile"
          className="h-10 w-full flex items-center min-w-0 rounded-lg border border-black/40 bg-white px-3 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 cursor-pointer"
          title={file?.name ?? "이미지 파일 선택"}
        >
          <span className="truncate">{file?.name ?? "이미지 파일을 선택하세요"}</span>
          <span className="ml-auto text-xs text-black/50">Browse</span>
        </label>

        <input type="file" className="hidden" accept="image/*" id="txtFile" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

        <div className="flex gap-2 flex-col sm:flex-row">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="h-10 w-full sm:w-auto sm:min-w-[160px] min-w-0 rounded-lg border border-black/40 bg-white px-3 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
          >
            <option value="kor+eng+jpn">한글+영어+일본어</option>
            <option value="kor+eng">한글+영어</option>
            <option value="jpn+eng">일본어+영어</option>
            <option value="eng">영어</option>
            <option value="kor">한글</option>
            <option value="jpn">일본어</option>
          </select>

          <select
            value={psm}
            onChange={(e) => setPsm(e.target.value)}
            className="h-10 w-full sm:w-auto sm:min-w-[190px] min-w-0 rounded-lg border border-black/40 bg-white px-3 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
          >
            <option value="6">문서 / 문단 (psm=6)</option>
            <option value="7">한 줄 텍스트 (psm=7)</option>
            <option value="11">흩어진 텍스트 (psm=11)</option>
            <option value="3">자동 추정 (psm=3)</option>
          </select>

          <button
            onClick={submit}
            disabled={!file || loading}
            className="h-10 w-full sm:w-auto rounded-lg border border-black/40 bg-white px-4 text-sm font-medium hover:bg-black/10 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 disabled:opacity-50"
          >
            {loading ? "처리중..." : "OCR 실행"}
          </button>
        </div>
      </div>

      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="preview" className="max-h-[240px] rounded border" />
      )}

      {error && <div className="text-red-600">{error}</div>}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="OCR 결과가 여기에 표시됩니다."
        className="min-h-[200px] w-full rounded-lg border border-black/40 bg-white p-4 text-sm font-medium outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 resize-none"
      />
    </div>
  );
};

export default OcrClient;
