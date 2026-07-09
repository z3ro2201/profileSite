import "server-only";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = "z3ro2201";
const REVALIDATE_SECONDS = 3600; // 1시간

// ── 타입 ──
export type LanguageStat = { name: string; pct: number; color: string };

export type GithubStats = {
  repos: number;
  prs: number;
  commits: number;
  languages: LanguageStat[];
};

// ── 내부 헬퍼 ──
const githubRest = async <T>(path: string): Promise<T> => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`GitHub REST error (${res.status}): ${path}`);
  return res.json();
};

const githubGraphql = async <T>(query: string, variables: Record<string, unknown>): Promise<T> => {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: REVALIDATE_SECONDS },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL error (${res.status})`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "GitHub GraphQL error");
  return json.data;
};

// ── 개별 함수 ──
const getRepoCount = async (): Promise<number> => {
  const user = await githubRest<{ public_repos: number; total_private_repos?: number }>("/user");
  return user.public_repos + (user.total_private_repos ?? 0);
};

const getPrCount = async (): Promise<number> => {
  const result = await githubRest<{ total_count: number }>(`/search/issues?q=author:${GITHUB_USERNAME}+type:pr`);
  return result.total_count;
};

const getTotalCommits = async (): Promise<number> => {
  const user = await githubRest<{ created_at: string }>("/user");
  const startYear = new Date(user.created_at).getFullYear();
  const thisYear = new Date().getFullYear();

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
        }
      }
    }
  `;

  let total = 0;
  for (let year = startYear; year <= thisYear; year++) {
    const data = await githubGraphql<{
      user: { contributionsCollection: { totalCommitContributions: number } };
    }>(query, {
      login: GITHUB_USERNAME,
      from: `${year}-01-01T00:00:00Z`,
      to: `${year}-12-31T23:59:59Z`,
    });
    total += data.user.contributionsCollection.totalCommitContributions;
  }
  return total;
};

const LANGUAGES_QUERY = `
  query($login: String!) {
    user(login: $login) {
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
        nodes {
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name color } }
          }
        }
      }
    }
  }
`;

const getLanguageStats = async (topN = 3): Promise<LanguageStat[]> => {
  const data = await githubGraphql<{
    user: {
      repositories: {
        nodes: { languages: { edges: { size: number; node: { name: string; color: string | null } }[] } }[];
      };
    };
  }>(LANGUAGES_QUERY, { login: GITHUB_USERNAME });

  const bytesByLang = new Map<string, { size: number; color: string }>();
  for (const repo of data.user.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      const prev = bytesByLang.get(edge.node.name);
      bytesByLang.set(edge.node.name, {
        size: (prev?.size ?? 0) + edge.size,
        color: edge.node.color ?? "#8b8b8b",
      });
    }
  }

  const total = [...bytesByLang.values()].reduce((sum, v) => sum + v.size, 0);
  const sorted = [...bytesByLang.entries()].sort((a, b) => b[1].size - a[1].size);

  const top: LanguageStat[] = sorted.slice(0, topN).map(([name, v]) => ({
    name,
    pct: Math.round((v.size / total) * 100),
    color: v.color,
  }));

  const otherSize = sorted.slice(topN).reduce((sum, [, v]) => sum + v.size, 0);
  if (otherSize > 0) {
    top.push({ name: "Other", pct: Math.round((otherSize / total) * 100), color: "#8b8b8b" });
  }

  return top;
};

// ── 외부에 실제로 노출할 것 ──
// 홈 화면 로드 한 번에 필요한 GitHub 데이터를 전부 병렬로 가져온다.
export async function getGithubStats(): Promise<GithubStats> {
  const [repos, prs, commits, languages] = await Promise.all([
    getRepoCount(),
    getPrCount(),
    getTotalCommits(),
    getLanguageStats(),
  ]);
  return { repos, prs, commits, languages };
}
