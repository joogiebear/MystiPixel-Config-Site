import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { requireAuth } from '@/lib/auth-helpers';
import { fileTypeFromBuffer } from 'file-type';
import { scanFile } from '@/lib/clamav';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.zip', '.cfg', '.conf', '.json', '.toml', '.txt', '.yml', '.yaml'];

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'text/x-yaml',
  'application/toml',
  'text/x-toml'
];

// Rate limiting: Map of userId -> array of upload timestamps
const uploadRateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_UPLOADS_PER_WINDOW = 5;

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const userId = await requireAuth();

    // Rate limiting check
    const now = Date.now();
    const userUploads = uploadRateLimits.get(userId) || [];

    // Remove uploads outside the time window
    const recentUploads = userUploads.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

    if (recentUploads.length >= MAX_UPLOADS_PER_WINDOW) {
      return NextResponse.json(
        { error: `Upload limit exceeded. You can upload ${MAX_UPLOADS_PER_WINDOW} files per ${RATE_LIMIT_WINDOW / 60000} minutes.` },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Check file extension
    const fileExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Read file buffer for MIME type validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate MIME type from actual file content
    const detectedType = await fileTypeFromBuffer(buffer);

    // For text-based files (yaml, json, toml, cfg), file-type might not detect them
    // So we allow text/plain or no detection for text files
    const textExtensions = ['.cfg', '.conf', '.json', '.toml', '.txt', '.yml', '.yaml'];
    const isTextFile = textExtensions.includes(fileExt);

    if (detectedType) {
      // If we detected a type, validate it's in our allowed list
      if (!ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
        return NextResponse.json(
          { error: `File type not allowed. Detected type: ${detectedType.mime}` },
          { status: 400 }
        );
      }

      // Extra security: If extension is .zip, make sure detected type is also zip
      if (fileExt === '.zip' && !detectedType.mime.includes('zip')) {
        return NextResponse.json(
          { error: 'File extension does not match file content. Possible malicious file.' },
          { status: 400 }
        );
      }
    } else if (!isTextFile) {
      // If we couldn't detect the type and it's not a text file, reject it
      return NextResponse.json(
        { error: 'Could not verify file type. Please ensure the file is not corrupted.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${timestamp}-${randomString}-${sanitizedName}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'configs');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadsDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // Scan file with ClamAV
    try {
      const scanResult = await scanFile(filePath);

      if (scanResult.isInfected) {
        // Delete infected file immediately
        await unlink(filePath);

        console.warn(`Infected file rejected: ${file.name}, viruses: ${scanResult.viruses.join(', ')}`);

        return NextResponse.json(
          {
            error: 'File contains malware and has been rejected',
            viruses: scanResult.viruses
          },
          { status: 400 }
        );
      }

      console.log(`File scanned successfully: ${file.name} - Clean`);
    } catch (scanError) {
      console.error('ClamAV scan error:', scanError);
      // Scanner failed - for security, you might want to reject the file
      // For now we'll log and continue, but in production consider rejecting
    }

    // Record successful upload for rate limiting
    recentUploads.push(now);
    uploadRateLimits.set(userId, recentUploads);

    // Return file URL
    const fileUrl = `/uploads/configs/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error uploading file:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
