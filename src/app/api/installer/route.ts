import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the latest release from GitHub
    const response = await fetch(
      'https://api.github.com/repos/netflypsb/solaris-cowork/releases/latest'
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch GitHub release');
    }
    
    const release = await response.json();
    
    // Find the installer asset
    const installerAsset = release.assets.find((asset: any) => 
      asset.name.includes('solaris-cowork-setup') && asset.name.endsWith('.exe')
    );
    
    if (!installerAsset) {
      return NextResponse.json(
        { error: 'Installer not found in GitHub release' },
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
