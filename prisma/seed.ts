import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminName = process.env.ADMIN_NAME ?? "Admin";

  // ✅ ADMIN_PASSWORD가 있을 때만 해시 생성(하드코딩 방지)
  const adminPassword = process.env.ADMIN_PASSWORD;
  const passwordHash = adminPassword ? await bcrypt.hash(adminPassword, 12) : undefined;

  /**
   * 1) 관리자 유저
   */
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      ...(passwordHash ? { passwordHash } : {}),
    },
    create: {
      email: adminEmail,
      name: adminName,
      ...(passwordHash ? { passwordHash } : {}),
    },
  });

  /**
   * 2) 카테고리
   */
  const categories = [
    { slug: "frontend", name: "Frontend" },
    { slug: "backend", name: "Backend" },
    { slug: "infra", name: "Infra" },
    { slug: "diary", name: "Diary" },
  ];

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });

  /**
   * 3) 태그
   */
  const tags = [
    { slug: "nextjs", name: "Next.js" },
    { slug: "react", name: "React" },
    { slug: "prisma", name: "Prisma" },
    { slug: "mariadb", name: "MariaDB" },
    { slug: "infra", name: "Infra" },
    { slug: "typescript", name: "TypeScript" },
  ];

  await prisma.tag.createMany({
    data: tags,
    skipDuplicates: true,
  });

  /**
   * 4) 샘플 게시글
   */
  const backendCategory = await prisma.category.findUnique({
    where: { slug: "backend" },
  });
  if (!backendCategory) throw new Error("backend category not found");

  // ✅ 스키마가 contentMd + state(+publishedAt) 라는 가정
  await prisma.post.upsert({
    where: { id: 1 },
    update: {
      // 원하면 seed 재실행 시 내용도 갱신되게 여기 채우면 됨
      // title: "...",
      // contentMd: "...",
    },
    create: {
      title: "Prisma + MariaDB 초기 세팅",
      contentMd: ["# Prisma + MariaDB 초기 세팅", "", "- Prisma 스키마 작성", "- migrate / seed", "- MariaDB 연결 확인", "", "샘플 글입니다."].join("\n"),
      contentHtml: null, // 선택: 서버에서 렌더 캐시를 만들 거면 나중에 채워도 됨

      state: "PUBLISHED",
      publishedAt: new Date(),

      authorId: admin.id,
      categoryId: backendCategory.id, // categoryId를 optional로 바꿨다면 없어도 됨

      tags: {
        connect: [{ slug: "prisma" }, { slug: "mariadb" }],
      },
    },
  });

  /**
   * 3) s4 프로젝트 카드 (기존 app/s4/_lib/theme.ts의 PROJECT_ITEMS 하드코딩 이관)
   *    slug 기준 upsert라 여러 번 돌려도 안전함.
   */
  const projects: Array<{
    slug: string;
    emoji: string;
    year?: number;
    title: string;
    subtitle: string;
    tags?: string[];
    category: string;
    color: string;
    period: string;
    contribution: string;
    url?: string;
    body: string;
    stack: { label: string; items: string[] }[];
    order: number;
  }> = [
    {
      slug: "p2008", emoji: "🏫", year: 2008, title: "'08 동서울대 홈페이지",
      subtitle: "동서울대학교 공식 홈페이지 리뉴얼 프로젝트.", tags: ["PHP"], category: "Web",
      color: "#f0ede8", period: "2008", contribution: "팀",
      body: "동서울대학교 공식 홈페이지 리뉴얼을 담당했습니다. 당시 PHP 기반으로 CMS를 구축하고 게시판, 공지사항 등 주요 기능을 구현했습니다.",
      stack: [{ label: "Backend", items: ["PHP"] }, { label: "Frontend", items: ["HTML", "CSS", "jQuery"] }],
      order: 0,
    },
    {
      slug: "p2009", emoji: "🏫", year: 2009, title: "'09 동서울대 홈페이지",
      subtitle: "전년도 홈페이지 유지보수 및 기능 개선.", tags: ["PHP"], category: "Web",
      color: "#f0ede8", period: "2009", contribution: "팀",
      body: "전년도 구축한 홈페이지의 유지보수 및 기능 개선 작업을 진행했습니다.",
      stack: [{ label: "Backend", items: ["PHP"] }],
      order: 1,
    },
    {
      slug: "p2015", emoji: "🌐", year: 2015, title: "nuribom.kr",
      subtitle: "개인 프리랜서 프로젝트.", tags: ["PHP"], category: "Web",
      color: "#eef5f0", period: "2015", contribution: "개인",
      body: "프리랜서로 진행한 웹사이트 구축 프로젝트입니다. 반응형 레이아웃과 관리자 페이지를 포함하여 제작했습니다.",
      stack: [{ label: "Backend", items: ["PHP", "MySQL"] }, { label: "Frontend", items: ["HTML5", "CSS3"] }],
      order: 2,
    },
    {
      slug: "p2016", emoji: "🐾", year: 2016, title: "마이론프렌즈",
      subtitle: "반려동물 커뮤니티 서비스.", tags: ["PHP"], category: "Web",
      color: "#fef5ee", period: "2016", contribution: "개인",
      body: "반려동물 보호자들을 위한 커뮤니티 플랫폼입니다. 게시판, 사진 업로드, 회원 관리 기능을 포함해 제작했습니다.",
      stack: [{ label: "Backend", items: ["PHP", "MySQL"] }],
      order: 3,
    },
    {
      slug: "p2018", emoji: "📄", year: 2018, title: "전자문서 시스템",
      subtitle: "기업용 전자결재 및 문서관리 시스템.", tags: ["PHP"], category: "Web",
      color: "#eef0f8", period: "2018", contribution: "팀",
      body: "중소기업 대상 전자결재 시스템입니다. 결재 라인 설정, 문서 템플릿 관리, PDF 출력 기능을 구현했습니다.",
      stack: [{ label: "Backend", items: ["PHP", "MySQL"] }, { label: "Frontend", items: ["Bootstrap", "jQuery"] }],
      order: 4,
    },
    {
      slug: "p2020", emoji: "📝", year: 2020, title: "명제교육원 자기진단 v1",
      subtitle: "학습자 자기진단 설문 웹 애플리케이션.", tags: ["Web"], category: "Web",
      color: "#f5f0ff", period: "2020", contribution: "개인",
      body: "교육원 학습자들이 자신의 학습 상태를 점검할 수 있는 진단 도구입니다. 설문 결과를 시각화하여 리포트로 제공합니다.",
      stack: [{ label: "Frontend", items: ["Vue.js", "Chart.js"] }, { label: "Backend", items: ["Node.js"] }],
      order: 5,
    },
    {
      slug: "p2022", emoji: "📝", year: 2022, title: "명제교육원 자기진단 v2",
      subtitle: "v1 리뉴얼 — UI/UX 전면 개선 및 기능 확장.", tags: ["Web"], category: "Web",
      color: "#f5f0ff", period: "2022", contribution: "개인",
      body: "v1 기반을 전면 리뉴얼했습니다. 모바일 최적화, 결과 PDF 출력, 관리자 대시보드를 새로 추가했습니다.",
      stack: [{ label: "Frontend", items: ["React", "Tailwind CSS"] }, { label: "Backend", items: ["Node.js", "PostgreSQL"] }],
      order: 6,
    },
    {
      slug: "p2023", emoji: "⚔️", year: 2023, title: "로스트아크 카오보",
      subtitle: "카오스보스 공략 정보 큐레이션 사이트.", tags: ["Web"], category: "Web",
      color: "#e8f5f2", period: "2023", contribution: "개인", url: "#",
      body: "로스트아크 카오스보스 공략 정보를 한 곳에서 확인할 수 있는 사이트입니다. 각 보스별 패턴, 공략 팁, 보상 정보를 정리했습니다.",
      stack: [{ label: "Frontend", items: ["Next.js", "Tailwind CSS"] }],
      order: 7,
    },
    {
      slug: "p2025a", emoji: "📞", year: 2025, title: "RPBX (Asterisk)",
      subtitle: "Asterisk 기반 소규모 PBX 솔루션.", tags: ["Node.js"], category: "App",
      color: "#fff0ee", period: "2025.01.", contribution: "개인",
      body: "Asterisk를 기반으로 한 소규모 사무용 PBX 시스템입니다. 내선 관리, 통화 기록, 음성 안내 설정을 웹 UI로 제어할 수 있습니다.",
      stack: [{ label: "Backend", items: ["Node.js", "Asterisk", "AMI"] }, { label: "Frontend", items: ["React"] }],
      order: 8,
    },
    {
      slug: "p2025b", emoji: "🎵", year: 2025, title: "음나 컨트롤러",
      subtitle: "음악 스트리밍 통합 컨트롤러 앱.", tags: ["Node.js"], category: "App",
      color: "#f5f0ff", period: "2025.02.", contribution: "개인",
      body: "여러 음악 스트리밍 서비스를 하나의 인터페이스로 제어할 수 있는 컨트롤러입니다. 재생/정지, 볼륨, 플레이리스트를 통합 관리합니다.",
      stack: [{ label: "Backend", items: ["Node.js"] }, { label: "Frontend", items: ["React", "Electron"] }],
      order: 9,
    },
    {
      slug: "p2025c", emoji: "📻", year: 2025, title: "라디오 (WEB)",
      subtitle: "웹 기반 라디오 스트리밍 앱.", tags: ["Web"], category: "Web",
      color: "#f0f8ff", period: "2025.07.", contribution: "개인", url: "#",
      body: "라디오 스트리밍을 웹에서 깔끔하게 즐길 수 있는 앱입니다. PWA 지원으로 모바일 홈 화면에 추가해 앱처럼 사용 가능합니다.",
      stack: [{ label: "Frontend", items: ["React", "TypeScript", "PWA"] }],
      order: 10,
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
}

main()
  .then(async () => {
    console.log("✅ Prisma seed completed");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Prisma seed failed", e);
    await prisma.$disconnect();
    process.exit(1);
  });
