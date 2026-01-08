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
