import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // List blobs to find the installer
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    const installerBlob = blobs.find(blob => 
      blob.pathname.includes('solaris-cowork-setup')
    );
    
    if (!installerBlob) {
      return NextResponse.json(
        { error: 'Installer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      url: installerBlob.url,
      downloadUrl: installerBlob.downloadUrl,
      pathname: installerBlob.pathname,
      size: installerBlob.size,
    });
  } catch (error) {
    console.error('Error fetching installer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installer' },
      { status: 500 }
    );
  }
}
