import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get('category');
    const modLoader = searchParams.get('modLoader');
    const isPremium = searchParams.get('isPremium');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'recent';

    // Build where clause
    const where: Prisma.ConfigWhereInput = {};

    if (category) {
      where.category = {
        slug: category
      };
    }

    if (modLoader) {
      where.modLoader = modLoader as any;
    }

    if (isPremium !== null && isPremium !== undefined) {
      where.isPremium = isPremium === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Build orderBy clause
    let orderBy: Prisma.ConfigOrderByWithRelationInput = {};

    switch (sort) {
      case 'popular':
        orderBy = { downloads: 'desc' };
        break;
      case 'rating':
        // Note: This requires aggregating ratings, for now we'll use views
        orderBy = { views: 'desc' };
        break;
      case 'downloads':
        orderBy = { downloads: 'desc' };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Fetch configs with relations
    const [configs, total] = await Promise.all([
      prisma.config.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true
            }
          },
          ratings: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              downloadRecords: true,
              favorites: true,
              comments: true
            }
          }
        }
      }),
      prisma.config.count({ where })
    ]);

    // Calculate average rating for each config
    const configsWithRatings = configs.map(config => {
      const ratings = config.ratings;
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      const { ratings: _, ...configWithoutRatings } = config;

      return {
        ...configWithoutRatings,
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings: ratings.length,
        downloadCount: config._count.downloadRecords,
        favoriteCount: config._count.favorites,
        commentCount: config._count.comments
      };
    });

    return NextResponse.json({
      configs: configsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configs' },
      { status: 500 }
    );
  }
}

// POST endpoint for creating new configs (from upload page)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const userId = await requireAuth();

    const body = await request.json();

    const {
      title,
      description,
      content,
      categoryId,
      modLoader,
      mcVersion,
      tagIds,
      isPremium,
      price,
      features,
      installation,
      fileUrl
    } = body;

    // Validation
    if (!title || !description || !categoryId || !modLoader) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (isPremium && (!price || price < 0.99)) {
      return NextResponse.json(
        { error: 'Premium configs must have a price of at least $0.99' },
        { status: 400 }
      );
    }

    // Create config
    const config = await prisma.config.create({
      data: {
        title,
        description,
        content: content || '',
        categoryId,
        modLoader,
        mcVersion: mcVersion || 'Any',
        isPremium: isPremium || false,
        price: isPremium ? price : null,
        fileUrl: fileUrl || null,
        authorId: userId,
        tags: tagIds ? {
          connect: tagIds.map((id: string) => ({ id }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        category: true,
        tags: true
      }
    });

    return NextResponse.json(config, { status: 201 });

  } catch (error) {
    console.error('Error creating config:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create config' },
      { status: 500 }
    );
  }
}
