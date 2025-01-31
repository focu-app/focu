export interface ReleaseData {
  version: string;
  notes: string;
  pub_date: string;
  size: number;
  platforms: {
    [key: string]: {
      signature: string;
      url: string;
    };
  };
}

export async function getLatestRelease(): Promise<ReleaseData> {
  const owner = "focu-app";
  const repo = "focu-app";

  // Fetch the latest release
  const releaseResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "NextJS-App",
      },
      next: { revalidate: 600 }, // Cache for 10 minutes
    },
  );

  if (!releaseResponse.ok) {
    throw new Error("Failed to fetch latest release");
  }

  const releaseData = await releaseResponse.json();

  const latestJsonAsset = releaseData.assets.find(
    (asset: any) => asset.name === "latest.json",
  );

  if (!latestJsonAsset) {
    throw new Error("latest.json not found in release assets");
  }

  const size = releaseData.assets.find((asset: any) =>
    asset.name.endsWith(".dmg"),
  ).size;

  // Fetch the content of latest.json
  const latestJsonResponse = await fetch(latestJsonAsset.browser_download_url);

  if (!latestJsonResponse.ok) {
    throw new Error("Failed to fetch latest.json");
  }

  return {
    ...((await latestJsonResponse.json()) as ReleaseData),
    size,
  };
}
