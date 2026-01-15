import Link from "next/link";

const PrivacyPage = () => {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">개인정보 처리방침</h1>

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
        <p>본 사이트는 브라우저의 localStorage를 사용하여 방문자를 식별합니다. 이는 통계 목적으로만 사용되며, 언제든지 브라우저 설정에서 삭제할 수 있습니다.</p>
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
