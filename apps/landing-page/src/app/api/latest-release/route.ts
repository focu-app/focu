import { NextResponse } from 'next/server';

export const revalidate = 600;

export async function GET() {
  const owner = 'focu-app';
  const repo = 'focu-app';

  try {
    // Fetch the latest release
    const releaseResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'NextJS-App',
        },
      }
    );

    if (!releaseResponse.ok) {
      throw new Error('Failed to fetch latest release');
    }

    const releaseData = await releaseResponse.json();

    // Find the latest.json asset
    const latestJsonAsset = releaseData.assets.find(
      (asset: any) => asset.name === 'latest.json'
    );

    if (!latestJsonAsset) {
      throw new Error('latest.json not found in release assets');
    }

    // Fetch the content of latest.json
    const latestJsonResponse = await fetch(latestJsonAsset.browser_download_url);

    if (!latestJsonResponse.ok) {
      throw new Error('Failed to fetch latest.json');
    }

    const latestJsonContent = await latestJsonResponse.json();
    console.log(latestJsonContent);

    return NextResponse.json(latestJsonContent);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch latest release information' }, { status: 500 });
  }
}
