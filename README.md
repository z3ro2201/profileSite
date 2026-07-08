# profileSite

개인 블로그 & 관리자 페이지 프로젝트입니다. **Next.js 16 (App Router)** 기반으로 구축되었으며, **JWT 쿠키 인증**, **Passkey(WebAuthn)**, **Google OTP(TOTP)**를 지원합니다. 데이터베이스는 **MariaDB + Prisma(v7)** 를 사용합니다.
(~26.07까지 사용된 페이지 입니다.)

---

## ✨ 주요 기능

- 🔐 인증
  - 비밀번호 로그인 (bcrypt)
  - Google OTP (TOTP)
  - Passkey (WebAuthn)
  - JWT **httpOnly 쿠키** 세션

- 🛡️ 보안
  - Edge Middleware로 `/admin/**` 보호
  - `/admin/login`, `/admin/logout` 예외 처리

- 📝 콘텐츠
  - 게시글(Post) / 카테고리(Category) / 태그(Tag)
  - 관리자 전용 글 작성

- ⚙️ 인프라
  - Prisma v7 + MariaDB
  - Prisma Adapter (MariaDB)

- 지도
  - leaflet

---

## 🧱 기술 스택

- **Frontend**: Next.js 16 (App Router), React
- **Backend**: Next.js Route Handlers
- **Auth**: JWT (jose), Passkey(@simplewebauthn), OTP(speakeasy)
- **DB**: MariaDB
- **ORM**: Prisma v7

---

## 📁 프로젝트 구조

```text
profileSite/
├─ app/
│  ├─ s2/                # 간단한 자기소개 페이지 (LinkedIn 스타일)
│  ├─ s3/                # 확장된 소개 / 포트폴리오 페이지
│  ├─ blog/              # 블로그 영역 (공개 콘텐츠)
│  │  ├─ page.tsx        # 글 목록
│  │  ├─ [slug]/         # 글 상세 페이지
│  │  └─ tags/           # 태그별 글 목록
│  ├─ admin/             # 관리자 영역 (인증 필요)
│  │  ├─ login/          # 관리자 로그인
│  │  ├─ posts/          # 글 작성 / 수정 / 관리
│  │  └─ page.tsx        # 관리자 대시보드
│  ├─ login/             # 공개 로그인 페이지
│  └─ api/
│     └─ auth/           # 인증 관련 API (비밀번호 / OTP / Passkey)
│        ├─ login/       # 비밀번호 로그인
│        ├─ otp/         # OTP 검증
│        ├─ passkey/     # Passkey(WebAuthn)
│        └─ logout/      # 로그아웃
├─ lib/
│  ├─ prisma.ts          # Prisma Client (MariaDB 어댑터 설정)
│  ├─ auth/              # 인증 관련 유틸리티
│  │  ├─ jwt.ts          # JWT 생성 / 검증
│  │  └─ cookies.ts      # 인증 쿠키 옵션 관리
│  ├─ otp-crypto.ts      # OTP 시크릿 암호화 / 복호화
│  └─ secure-cookie.ts   # WebAuthn challenge용 임시 서명 쿠키
├─ prisma/
│  ├─ schema.prisma      # Prisma 스키마 정의
│  └─ seed.ts            # 초기 데이터 시드
├─ middleware.ts         # /admin 경로 접근 제어
├─ scripts/
│  └─ admin-utils.ts     # 관리자 관련 유틸 스크립트
└─ README.md
```

---

## 🔑 환경 변수 (.env)

```env
# ===== 관리자 초기 계정 (개발/초기 세팅용) =====
ADMIN_EMAIL="사용할아이디"
ADMIN_NAME="이름"
ADMIN_PASSWORD="원하는초기비밀번호"

# ===== Database (MariaDB + Prisma) =====
DATABASE_URL="mysql://아이디:비밀번호@주소:포트/DB이름"
SHADOW_DATABASE_URL="mysql://아이디:비밀번호@주소:포트/DB이름_shadow"

# ===== WebAuthn (Passkey) =====
# 사이트 도메인 기반 (배포/로컬 각각 설정)
APP_ORIGIN=""        # 로컬: http://localhost:3000
RP_ID=""             # 로컬: localhost

# ===== OTP (Google Authenticator) =====
# OTP secret 암호화용 키 (32바이트 이상, base64 인코딩)
OTP_ENC_KEY_BASE64=""

# ===== Auth (JWT Cookie) =====
AUTH_COOKIE_SECRET=""
AUTH_JWT_SECRET=""
AUTH_COOKIE_NAME="auth"
AUTH_COOKIE_MAXAGE="1209600" # 14일(초)
```

env
DATABASE_URL="mysql://user:password@host:3306/db"

# JWT

AUTH_JWT_SECRET="very-long-random-string"
AUTH_COOKIE_NAME="auth"
AUTH_COOKIE_MAXAGE="1209600"

# WebAuthn

APP_ORIGIN="[https://example.com](https://example.com)"
RP_ID="example.com"

# OTP

OTP_ENC_KEY_BASE64="base64-encoded-32bytes-key"

# (개발용) 관리자 초기 비밀번호

ADMIN_EMAIL="[admin@example.com](mailto:admin@example.com)"
ADMIN_PASSWORD="change-me"

````

---

## 🚀 실행 방법

### 1) 의존성 설치
```bash
sudo dnf -y install epel-release
sudo dnf -y install tesseract
sudo dnf -y install tesseract-langpack-eng tesseract-langpack-kor tesseract-langpack-jpn
sudo dnf -y install ImageMagick
yarn install
yarn add leaflet react-leaflet
yarn add -D @types/leaflet

````

```windows
choco install tesseract
tesseract --version
tesseract --list-langs
choco install imagemagick
yarn install
```

```macOS
brew install tesseract
brew install tesseract-lang
tesseract --list-langs
brew install imagemagick
yarn install
```

### 2) DB 마이그레이션 & 시드

```bash
npx prisma migrate dev --name add_page_visits --create-only
npx prisma migrate dev --name add-comments-trackbacks
npx prisma migrate dev --name add-comment-password
npx prisma migrate dev --name add_file_metadata_fields
npx prisma migrate dev --name sync_schema --create-only

npx prisma generate --schema prisma/schema.loa.prisma
npx prisma migrate dev
npx prisma db seed
npx prisma generate
npx prisma db push --force

```

### 3) 개발 서버 실행

```bash
yarn dev
```

## Middleware -> proxy 자동변환 추가

npx @next/codemod@latest middleware-to-proxy .

---

## 🔐 인증 플로우 요약

- **Password 로그인**
  1. 비밀번호 검증
  2. OTP 활성화 시 → OTP 검증
  3. 성공 시 JWT 쿠키 발급

- **Passkey 로그인**
  1. WebAuthn challenge 발급
  2. 브라우저 인증
  3. 검증 성공 시 JWT 쿠키 발급

- **관리자 보호**
  - `/admin/**` → 로그인 필수
  - `/admin/login`, `/admin/logout` → 예외

---

## 📌 보안 참고 사항

- 인증 토큰은 **localStorage를 사용하지 않음**
- JWT는 httpOnly + secure 쿠키로만 관리
- Passkey challenge는 단기 임시 쿠키(`secure-cookie.ts`) 사용

---

## 🧪 관리자 계정 초기화

개발 환경에서만 사용:

```bash
npx tsx scripts/set-admin-password.ts
```

또는 `.env`의 `ADMIN_PASSWORD`로 seed 시 자동 설정 가능.

---

## 📄 라이선스

개인 프로젝트 (Private)
