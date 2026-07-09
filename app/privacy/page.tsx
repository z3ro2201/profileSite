import Link from "next/link";
import { TEAL, mono, serif } from "@/app/s4/_lib/theme";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@/components/ui-v2/card";

import { UserCheck, Target, Clock, Send, Building2, MessageSquare } from "lucide-react";

const PrivacyPage = () => {
  const PRIVACY_LABELS = [
    { icon: UserCheck, label: "필수 개인정보 수집", value: "이메일 주소\n(문의 시 한정)" },
    { icon: Target, label: "개인정보 처리목적", value: "문의 응대\n서비스 개선" },
    { icon: Clock, label: "개인정보보유 기간", value: "목적 달성 후\n즉시 파기" },
    { icon: Send, label: "개인정보의 제공", value: "원칙적\n제3자 미제공" },
    { icon: Building2, label: "처리위탁", value: "Google LLC\n(AdSense)" },
    { icon: MessageSquare, label: "개인정보 보호책임자", value: "hello@2er0.io" },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/blog"
        className="flex items-center gap-1.5 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        style={mono}
      >
        ← 목록으로
      </Link>

      <div className="mb-4">
        <span className="block text-4xl sm:text-5xl font-light leading-tight" style={serif}>
          개인정보
        </span>
        <span className="block text-4xl sm:text-5xl font-light leading-tight" style={serif}>
          처리방침
        </span>
      </div>
      <div
        className="rounded-2xl px-5 py-4 mb-10 text-sm text-muted-foreground leading-relaxed font-light"
        style={{ background: "var(--secondary)", borderLeft: "3px solid rgb(35, 198, 169)" }}
      >
        <strong>2ER0.io</strong>&nbsp;는 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을
        신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
      </div>

      <div className="mb-4">
        <p className="text-[10px] tracking-widest uppercase mb-4 text-muted-foreground" style={mono}>
          주요 개인정보 처리 표시 (라벨링)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRIVACY_LABELS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-border p-4 flex flex-col items-center text-center gap-3"
              style={{ background: "var(--card)" }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(35,198,169,0.1)" }}
              >
                <Icon size={18} style={{ color: TEAL }} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-foreground mb-1 leading-snug">{label}</p>
                <p className="text-[10px] text-muted-foreground whitespace-pre-line leading-relaxed" style={mono}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. 수집하는 정보</h2>
        <p>본 사이트는 서비스 개선을 위해 다음 정보를 수집합니다:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>방문 페이지 URL</li>
          <li>접속 시간</li>
          <li>브라우저 종류 및 버전</li>
          <li>운영체제</li>
          <li>디바이스 종류 (PC/모바일/태블릿)</li>
          <li>화면 해상도</li>
          <li>유입 경로</li>
          {/* <li>위치 정보 (국가/도시 수준)</li> */}
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. 정보의 이용 목적</h2>
        <ul className="list-disc ml-6">
          <li>웹사이트 트래픽 분석</li>
          <li>콘텐츠 및 서비스 개선</li>
          <li>사용자 경험 향상</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. 정보의 보관 기간</h2>
        <p>수집된 정보는 수집일로부터 1년간 보관 후 자동 삭제됩니다.</p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. 제3자 제공</h2>
        <p>수집된 정보는 제3자에게 제공되지 않습니다.</p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. 쿠키 및 저장소 사용</h2>
        <p>
          본 사이트는 브라우저의 localStorage를 사용하여 방문자를 식별합니다. 이는 통계 목적으로만 사용되며, 언제든지
          브라우저 설정에서 삭제할 수 있습니다.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. 사용자 권리</h2>
        <p>이용자는 언제든지 본인의 정보에 대한 열람, 정정, 삭제를 요청할 수 있습니다.</p>
        <p className="mt-2">문의: hello@2er0.io</p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. 개인정보 보호책임자</h2>
        <p>연락처: hello@2er0.io</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">8. 고지 의무</h2>
        <p>본 개인정보 처리방침은 2026년 1월 15일부터 시행됩니다.</p>
      </section>
      <div className="mt-10">
        <Link href="/s3" className="my-2 p-2 bg-white border rounded-lg">
          처음화면으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default PrivacyPage;
