import { NextResponse } from 'next/server';

// Force dynamic rendering - do not pre-render at build time
export const dynamic = 'force-dynamic';

// GitHub API types for release assets
interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
  updated_at: string;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  assets: GitHubAsset[];
}

export async function GET() {
  try {
    const response = await fetch(
      'https://api.github.com/repos/netflypsb/solaris-cowork/releases',
      { next: { revalidate: 0 } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub releases');
    }

    const releases: GitHubRelease[] = await response.json();

    // Map releases to include only the installer asset for each
    const mappedReleases = releases.map((release) => {
      const installerAsset = release.assets.find(
        (asset) =>
          asset.name.includes('Solaris.Cowork.Setup') && asset.name.endsWith('.exe')
      );

      return {
        tag_name: release.tag_name,
        name: release.name,
        published_at: release.published_at,
        installer: installerAsset
          ? {
              name: installerAsset.name,
              download_url: installerAsset.browser_download_url,
              size: installerAsset.size,
              updated_at: installerAsset.updated_at,
            }
          : null,
      };
    });

    // Filter only releases that have an installer
    const releasesWithInstaller = mappedReleases.filter((r) => r.installer !== null);

    return NextResponse.json(releasesWithInstaller);
  } catch (error) {
    console.error('Error fetching releases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch releases' },
      { status: 500 }
    );
  }
}
