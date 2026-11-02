import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename to prevent special character or URI encoding issues
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${cleanName}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');

    // Agar uploads folder nahi hai toh bana dein
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // If standalone build output exists, mirror file there as well to ensure static serving
    const standaloneUploadDir = path.join(process.cwd(), '.next', 'standalone', 'public', 'uploads');
    if (fs.existsSync(path.dirname(standaloneUploadDir))) {
      if (!fs.existsSync(standaloneUploadDir)) {
        fs.mkdirSync(standaloneUploadDir, { recursive: true });
      }
      await writeFile(path.join(standaloneUploadDir, filename), buffer);
    }

    // Database mein save karne ke liye relative URL return karein
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error('[POST /api/admin/upload] Error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}