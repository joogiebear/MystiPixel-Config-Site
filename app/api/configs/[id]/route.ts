import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { getServerSession } from 'next-auth';

// GET single config by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment view count
    await prisma.config.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    // Fetch config with all relations
    const config = await prisma.config.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            createdAt: true,
            _count: {
              select: {
                configs: true
              }
            }
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            downloadRecords: true,
            favorites: true,
            comments: true,
            ratings: true
          }
        }
      }
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating = config.ratings.length > 0
      ? config.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / config.ratings.length
      : 0;

    // Calculate rating distribution
    const ratingDistribution = {
      5: config.ratings.filter((r: any) => r.rating === 5).length,
      4: config.ratings.filter((r: any) => r.rating === 4).length,
      3: config.ratings.filter((r: any) => r.rating === 3).length,
      2: config.ratings.filter((r: any) => r.rating === 2).length,
      1: config.ratings.filter((r: any) => r.rating === 1).length,
    };

    return NextResponse.json({
      ...config,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: config.ratings.length,
      ratingDistribution,
      downloadCount: config._count.downloadRecords,
      favoriteCount: config._count.favorites,
      commentCount: config._count.comments
    });

  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

// PATCH endpoint for updating configs
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require authentication
    const userId = await requireAuth();

    const body = await request.json();

    const {
      title,
      description,
      content,
      installationGuide,
      dependencies,
      categoryId,
      modLoader,
      tags, // Array of tag names (strings)
      gameModeIds,
      minecraftVersionIds,
      isPremium,
      price,
      imageUrl,
      fileUrl
    } = body;

    // Check if config exists and user owns it (or is admin)
    const existingConfig = await prisma.config.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      );
    }

    // Check authorization (must be author or admin)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });

    if (existingConfig.authorId !== userId && !user?.isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this config' },
        { status: 403 }
      );
    }

    // Validation
    if (!title || !description || !categoryId || !modLoader) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!minecraftVersionIds || minecraftVersionIds.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one Minecraft version' },
        { status: 400 }
      );
    }

    if (isPremium && (!price || price < 0.99)) {
      return NextResponse.json(
        { error: 'Premium configs must have a price of at least $0.99' },
        { status: 400 }
      );
    }

    // Process tags - auto-create if they don't exist
    const tagIds: string[] = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const trimmedName = tagName.trim();
        if (!trimmedName) continue;

        // Generate slug from name
        const slug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

        // Find or create tag
        let tag = await prisma.tag.findUnique({ where: { slug } });

        if (!tag) {
          // Create new tag
          tag = await prisma.tag.create({
            data: {
              name: trimmedName,
              slug: slug
            }
          });
        }

        tagIds.push(tag.id);
      }
    }

    // Update config with all relations
    const config = await prisma.config.update({
      where: { id },
      data: {
        title,
        description,
        content: content || '',
        installationGuide: installationGuide !== undefined ? installationGuide : existingConfig.installationGuide,
        dependencies: dependencies !== undefined ? dependencies : existingConfig.dependencies,
        categoryId,
        modLoader,
        isPremium: isPremium || false,
        price: isPremium ? price : null,
        imageUrl: imageUrl !== undefined ? imageUrl : existingConfig.imageUrl,
        fileUrl: fileUrl !== undefined ? fileUrl : existingConfig.fileUrl,
        // Disconnect all and reconnect with new ones
        tags: {
          set: [], // Clear existing
          connect: tagIds.length > 0 ? tagIds.map((id) => ({ id })) : []
        },
        gameModes: {
          set: [], // Clear existing
          connect: gameModeIds && gameModeIds.length > 0 ? gameModeIds.map((id: string) => ({ id })) : []
        },
        minecraftVersions: {
          set: [], // Clear existing
          connect: minecraftVersionIds.map((id: string) => ({ id }))
        }
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
        tags: true,
        gameModes: true,
        minecraftVersions: true
      }
    });

    return NextResponse.json(config);

  } catch (error) {
    console.error('Error updating config:', error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for deleting configs
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Add authentication and authorization check
    // Make sure the user owns this config

    await prisma.config.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Config deleted successfully' });

  } catch (error) {
    console.error('Error deleting config:', error);
    return NextResponse.json(
      { error: 'Failed to delete config' },
      { status: 500 }
    );
  }
}
