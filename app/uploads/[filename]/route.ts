import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface RouteParams {
  params: Promise<{ filename: string }>;
}

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { filename } = await params;

    // Prevent directory traversal attacks
    const cleanFilename = path.basename(filename);
    const ext = path.extname(cleanFilename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Candidate locations where uploaded files can reside
    const candidatePaths = [
      path.join(process.cwd(), 'public', 'uploads', cleanFilename),
      path.join(process.cwd(), 'uploads', cleanFilename),
      path.join(process.cwd(), '..', 'public', 'uploads', cleanFilename),
      path.join(process.cwd(), '.next', 'standalone', 'public', 'uploads', cleanFilename),
    ];

    let foundPath: string | null = null;
    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        foundPath = candidate;
        break;
      }
    }

    if (!foundPath) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(foundPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[GET /uploads/:filename] Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

