const PALETTE = [
  "#f05a28",
  "#7b3ff2",
  "#2d9cdb",
  "#f2c94c",
  "#27ae60",
  "#eb5757",
];

export function parseTechBreakdown(items) {
  if (!Array.isArray(items)) return [];
  const parsed = items
    .map((item) => {
      const text = String(item || "").trim();
      if (!text) return null;
      const match = text.match(/^(.*?)(\d+(?:\.\d+)?)\s*%$/);
      if (!match) return null;
      const name = match[1].trim();
      const pct = Number(match[2]);
      if (!name || Number.isNaN(pct)) return null;
      return { name, pct };
    })
    .filter(Boolean);

  if (!parsed.length) return [];
  const total = parsed.reduce((sum, item) => sum + item.pct, 0) || 0;
  return parsed.map((item, index) => ({
    name: item.name,
    pct: total ? (item.pct / total) * 100 : item.pct,
    color: PALETTE[index % PALETTE.length],
  }));
}

export function buildLanguageStats(languages) {
  const entries = Object.entries(languages || {});
  if (!entries.length) return [];
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([lang, bytes]) => {
      if (!total) return lang;
      const pct = (bytes / total) * 100;
      return `${lang} ${Number(pct.toFixed(1))}%`;
    });
}

export function parseGithubRepo(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  if (raw.includes("github.com")) {
    try {
      const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length < 2) return null;
      return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
    } catch {
      return null;
    }
  }
  const parts = raw.split("/").filter(Boolean);
  if (parts.length >= 2)
    return {
      owner: parts[parts.length - 2],
      repo: parts[parts.length - 1].replace(/\.git$/i, ""),
    };
  return null;
}

async function fetchGithubPagesUrl(owner, repo, headers) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pages`,
      { headers }
    );
    if (!res.ok) return "";
    const data = await res.json();
    return data?.html_url || data?.url || "";
  } catch {
    return "";
  }
}

async function fetchDeploymentUrl(owner, repo, headers) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/deployments?environment=production&per_page=1`,
      { headers }
    );
    if (!res.ok) return "";
    const deployments = await res.json();
    if (!Array.isArray(deployments) || !deployments.length) return "";
    const dep = deployments[0];
    if (dep?.environment_url) return dep.environment_url;
    const sRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/deployments/${dep.id}/statuses?per_page=1`,
      { headers }
    );
    if (!sRes.ok) return "";
    const statuses = await sRes.json();
    if (!Array.isArray(statuses) || !statuses.length) return "";
    return statuses[0]?.environment_url || statuses[0]?.target_url || "";
  } catch {
    return "";
  }
}

export async function connectGithubRepo({ githubUrl, currentTitle, hasDesc }) {
  const parsed = parseGithubRepo(githubUrl);
  if (!parsed) throw new Error("Paste a valid GitHub repo URL (owner/repo).");

  const headers = { Accept: "application/vnd.github+json" };

  const repoRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
    { headers }
  );
  if (repoRes.status === 404) throw new Error("GitHub repo not found.");
  if (repoRes.status === 403) throw new Error("GitHub rate limit reached. Try again later.");
  if (!repoRes.ok) throw new Error("Unable to connect to GitHub.");
  const repoData = await repoRes.json();

  const langRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/languages`,
    { headers }
  );
  if (!langRes.ok) throw new Error("Unable to fetch language data.");
  const langData = await langRes.json();
  const techList = buildLanguageStats(langData);

  let liveUrl = "";
  const homepage = String(repoData?.homepage || "").trim();
  if (homepage) {
    liveUrl = homepage;
  } else {
    const pagesUrl = await fetchGithubPagesUrl(parsed.owner, parsed.repo, headers);
    if (pagesUrl) liveUrl = pagesUrl;
    const depUrl = await fetchDeploymentUrl(parsed.owner, parsed.repo, headers);
    if (depUrl) liveUrl = depUrl;
  }

  return {
    tech: techList,
    github: repoData?.html_url || githubUrl,
    title: !currentTitle && repoData?.name ? repoData.name : currentTitle,
    description: !hasDesc && repoData?.description ? repoData.description : null,
    live: liveUrl,
  };
}
