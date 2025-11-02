import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Run all queries in parallel for better performance
    const [
      totalConfigs,
      totalUsers,
      totalDownloads,
      premiumCreators,
      featuredConfigs
    ] = await Promise.all([
      // Total configs
      prisma.config.count(),

      // Total users
      prisma.user.count(),

      // Total downloads (sum of all download counts)
      prisma.config.aggregate({
        _sum: {
          downloads: true
        }
      }),

      // Premium creators (users with at least 1 premium config)
      prisma.user.count({
        where: {
          configs: {
            some: {
              isPremium: true
            }
          }
        }
      }),

      // Featured configs (top 6 by downloads)
      prisma.config.findMany({
        take: 6,
        orderBy: {
          downloads: 'desc'
        },
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
              name: true,
              slug: true
            }
          },
          ratings: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              downloads: true
            }
          }
        }
      })
    ]);

    // Calculate average ratings for featured configs
    const featuredConfigsWithRatings = featuredConfigs.map(config => {
      const avgRating = config.ratings.length > 0
        ? config.ratings.reduce((sum, r) => sum + r.rating, 0) / config.ratings.length
        : 0;

      const { ratings, ...rest } = config;

      return {
        ...rest,
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings: ratings.length,
        downloadCount: config._count.downloads
      };
    });

    return NextResponse.json({
      stats: {
        totalConfigs,
        totalUsers,
        totalDownloads: totalDownloads._sum.downloads || 0,
        premiumCreators
      },
      featuredConfigs: featuredConfigsWithRatings
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
