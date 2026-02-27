import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create Supabase client with service role for storage access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Get the installer file from the storage bucket
    const { data } = await supabase
      .storage
      .from('installers')
      .getPublicUrl('solaris-cowork-setup-0.1.2.exe');

    if (!data?.publicUrl) {
      return NextResponse.json(
        { error: 'Installer not found in storage' },
        { status: 404 }
      );
    }

    // Get file metadata
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('installers')
      .list('', {
        search: 'solaris-cowork-setup-0.1.2.exe',
      });

    if (fileError) {
      console.error('Error fetching file metadata:', fileError);
    }

    const fileInfo = fileData?.[0];
    
    return NextResponse.json({
      url: data.publicUrl,
      downloadUrl: data.publicUrl,
      pathname: 'solaris-cowork-setup-0.1.2.exe',
      size: fileInfo?.metadata?.size || 197971200, // ~188MB default
      updated_at: fileInfo?.updated_at,
    });
  } catch (error) {
    console.error('Error fetching installer from Supabase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installer' },
      { status: 500 }
    );
  }
}
