import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        configs: [],
        tags: [],
        users: []
      });
    }

    const searchTerm = query.trim();

    // Search configs
    const configs = await prisma.config.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { content: { contains: searchTerm } },
          {
            tags: {
              some: {
                name: { contains: searchTerm }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            downloadRecords: true,
            ratings: true
          }
        }
      },
      take: 10,
      orderBy: [
        { downloads: 'desc' },
        { views: 'desc' }
      ]
    });

    // Search tags
    const tags = await prisma.tag.findMany({
      where: {
        name: { contains: searchTerm }
      },
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
      take: 5
    });

    // Search users/authors
    const users = await prisma.user.findMany({
      where: {
        name: { contains: searchTerm }
      },
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: {
            configs: true
          }
        }
      },
      take: 5
    });

    return NextResponse.json({
      configs: configs.map(c => ({
        ...c,
        downloadCount: c._count.downloadRecords,
        ratingCount: c._count.ratings
      })),
      tags,
      users
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
