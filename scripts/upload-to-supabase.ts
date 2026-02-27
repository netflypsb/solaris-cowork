import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function uploadInstaller() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const filePath = resolve(process.cwd(), 'Solaris Cowork Setup 0.1.2.exe');
  
  try {
    console.log('Reading installer file...');
    const fileBuffer = readFileSync(filePath);
    const fileSize = fileBuffer.length;
    
    console.log(`File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log('Uploading to Supabase Storage...');
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('installers')
      .upload('solaris-cowork-setup-0.1.2.exe', fileBuffer, {
        contentType: 'application/octet-stream',
        upsert: true,
      });
    
    if (error) {
      console.error('Upload failed:', error);
      process.exit(1);
    }
    
    console.log('Upload successful!');
    console.log('Path:', data?.path);
    
    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('installers')
      .getPublicUrl('solaris-cowork-setup-0.1.2.exe');
    
    console.log('Public URL:', publicUrlData.publicUrl);
    
    // Save URL to file for reference
    const fs = require('fs');
    fs.writeFileSync('installer-url.txt', publicUrlData.publicUrl);
    
  } catch (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }
}

uploadInstaller();
