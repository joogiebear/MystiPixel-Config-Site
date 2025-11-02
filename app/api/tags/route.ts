import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get all tags (public) sorted by popularity
export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            configs: true
          }
        }
      },
      orderBy: {
        configs: {
          _count: 'desc' // Sort by most used first
        }
      }
    });

    // Transform to include usage count
    const tagsWithCount = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      usageCount: tag._count.configs
    }));

    return NextResponse.json({ tags: tagsWithCount });

  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
