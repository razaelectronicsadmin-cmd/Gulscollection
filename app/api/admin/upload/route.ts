import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${cleanName}`;

    // Hostinger ka exact permanent absolute path (Yeh folder Git deployment se bahar hai)
    const uploadDir = '/home/u175598648/domains/gulscollection.com/public_html/uploads';
    const filepath = path.join(uploadDir, filename);

    // File ko direct permanent path par write karein
    await writeFile(filepath, buffer);

    // Database mein save karne ke liye relative URL return karein
    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error('[POST /api/admin/upload] Error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}