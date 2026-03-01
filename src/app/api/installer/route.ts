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
  assets: GitHubAsset[];
}

export async function GET() {
  try {
    // Fetch all releases and find v0.1.3 specifically
    const response = await fetch(
      'https://api.github.com/repos/netflypsb/solaris-cowork/releases',
      { next: { revalidate: 0 } } // No cache
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch GitHub releases');
    }
    
    const releases: GitHubRelease[] = await response.json();
    
    // Find v0.1.3 release specifically
    const release = releases.find(r => r.tag_name === 'v0.1.3') || releases[0];
    
    if (!release) {
      return NextResponse.json(
        { error: 'No releases found' },
        { status: 404 }
      );
    }
    
    // Debug: log all assets
    console.log('Release:', release.tag_name, 'Assets:', release.assets.map(a => a.name));
    
    // Find the installer asset
    const installerAsset = release.assets.find((asset: GitHubAsset) => 
      asset.name.includes('Solaris.Cowork.Setup') && asset.name.endsWith('.exe')
    );
    
    if (!installerAsset) {
      return NextResponse.json(
        { error: 'Installer not found in GitHub release', assets: release.assets.map(a => a.name) },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      url: installerAsset.browser_download_url,
      downloadUrl: installerAsset.browser_download_url,
      pathname: installerAsset.name,
      size: installerAsset.size,
      updated_at: installerAsset.updated_at,
      version: release.tag_name,
    });
  } catch (error) {
    console.error('Error fetching installer from GitHub:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installer' },
      { status: 500 }
    );
  }
}
