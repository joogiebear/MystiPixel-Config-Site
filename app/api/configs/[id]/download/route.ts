import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch config
    const config = await prisma.config.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        isPremium: true,
        price: true,
        downloads: true
      }
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    if (!config.fileUrl) {
      return NextResponse.json(
        { error: 'No file available for download' },
        { status: 404 }
      );
    }

    // TODO: Add authentication for premium configs
    // if (config.isPremium) {
    //   const session = await getServerSession();
    //   if (!session) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    //   }
    //   // Check if user has purchased this config
    //   const hasPurchased = await checkUserPurchase(session.user.id, id);
    //   if (!hasPurchased) {
    //     return NextResponse.json({ error: 'Purchase required' }, { status: 403 });
    //   }
    // }

    // Record download
    const userId = null; // TODO: Get from session
    await prisma.download.create({
      data: {
        configId: id,
        userId: userId
      }
    });

    // Increment download counter
    await prisma.config.update({
      where: { id },
      data: {
        downloads: {
          increment: 1
        }
      }
    });

    // Get file path
    const filePath = path.join(process.cwd(), config.fileUrl);

    try {
      // Read file
      const fileBuffer = await readFile(filePath);

      // Get filename from URL
      const filename = path.basename(config.fileUrl);
      const sanitizedTitle = config.title.replace(/[^a-zA-Z0-9-]/g, '_');
      const downloadFilename = `${sanitizedTitle}${path.extname(filename)}`;

      // Return file
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${downloadFilename}"`,
          'Content-Length': fileBuffer.length.toString()
        }
      });

    } catch (fileError) {
      console.error('Error reading file:', fileError);
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error processing download:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
}

// GET endpoint to get download URL (for premium configs after payment)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const config = await prisma.config.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        isPremium: true
      }
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // TODO: Add purchase verification for premium configs

    return NextResponse.json({
      downloadUrl: `/api/configs/${id}/download`,
      fileName: config.title,
      isPremium: config.isPremium
    });

  } catch (error) {
    console.error('Error getting download info:', error);
    return NextResponse.json(
      { error: 'Failed to get download info' },
      { status: 500 }
    );
  }
}
