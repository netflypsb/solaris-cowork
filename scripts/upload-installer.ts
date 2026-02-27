import { put } from '@vercel/blob';
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function uploadInstaller() {
  const filePath = resolve(process.cwd(), 'Solaris Cowork Setup 0.1.2.exe');
  
  try {
    const fileBuffer = readFileSync(filePath);
    
    const blob = await put('solaris-cowork-setup-0.1.2.exe', fileBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    console.log('Upload successful!');
    console.log('URL:', blob.url);
    console.log('Download URL:', blob.downloadUrl);
    
    // Save the URL to a file for reference
    const fs = require('fs');
    fs.writeFileSync('installer-url.txt', blob.url);
    
  } catch (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }
}

uploadInstaller();
