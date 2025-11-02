import { PrismaClient, ModLoader } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Performance',
        slug: 'performance',
        description: 'Boost your FPS and game performance',
        icon: '⚡'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Server',
        slug: 'server',
        description: 'Server optimization and management',
        icon: '🖥️'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Modpacks',
        slug: 'modpacks',
        description: 'Complete modpack configurations',
        icon: '📦'
      }
    }),
    prisma.category.create({
      data: {
        name: 'PvP',
        slug: 'pvp',
        description: 'Competitive PvP settings',
        icon: '⚔️'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Graphics',
        slug: 'graphics',
        description: 'Visual enhancements and shaders',
        icon: '🎨'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Utilities',
        slug: 'utilities',
        description: 'Utility mods and tools',
        icon: '🔧'
      }
    })
  ])

  console.log('Created categories')

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Performance' } }),
    prisma.tag.create({ data: { name: 'FPS Boost' } }),
    prisma.tag.create({ data: { name: 'Optimization' } }),
    prisma.tag.create({ data: { name: 'Client-side' } }),
    prisma.tag.create({ data: { name: 'Server-side' } }),
    prisma.tag.create({ data: { name: 'PvP' } }),
    prisma.tag.create({ data: { name: 'Shaders' } })
  ])

  console.log('Created tags')

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const user1 = await prisma.user.create({
    data: {
      name: 'ConfigMaster',
      email: 'config@master.com',
      password: hashedPassword,
      isPremium: true,
      bio: 'Professional config creator with 5+ years of experience'
    }
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'ServerPro',
      email: 'server@pro.com',
      password: hashedPassword,
      isPremium: true,
      bio: 'Server optimization specialist'
    }
  })

  const user3 = await prisma.user.create({
    data: {
      name: 'BudgetGamer',
      email: 'budget@gamer.com',
      password: hashedPassword,
      bio: 'Helping low-end PC players enjoy Minecraft'
    }
  })

  console.log('Created users')

  // Create sample configs
  const config1 = await prisma.config.create({
    data: {
      title: 'Ultimate Performance Pack',
      description: 'Boost your FPS by up to 200% with this carefully optimized configuration pack. This comprehensive config bundle includes optimized settings for all major performance mods.',
      content: 'Sample config content here...',
      categoryId: categories[0].id,
      modLoader: ModLoader.FORGE,
      mcVersion: '1.20.1',
      isPremium: true,
      price: 4.99,
      downloads: 12500,
      views: 25000,
      authorId: user1.id,
      tags: {
        connect: [
          { id: tags[0].id },
          { id: tags[1].id },
          { id: tags[2].id }
        ]
      }
    }
  })

  const config2 = await prisma.config.create({
    data: {
      title: 'Server Optimization Bundle',
      description: 'Complete server optimization for large player counts and minimal lag. Perfect for SMP servers.',
      content: 'Sample server config...',
      categoryId: categories[1].id,
      modLoader: ModLoader.FABRIC,
      mcVersion: '1.20.1',
      isPremium: false,
      downloads: 8200,
      views: 15000,
      authorId: user2.id,
      tags: {
        connect: [
          { id: tags[2].id },
          { id: tags[4].id }
        ]
      }
    }
  })

  const config3 = await prisma.config.create({
    data: {
      title: 'Low-End PC Essentials',
      description: 'Play Minecraft smoothly on low-end hardware with these optimized settings.',
      content: 'Sample low-end config...',
      categoryId: categories[0].id,
      modLoader: ModLoader.FORGE,
      mcVersion: '1.19.4',
      isPremium: false,
      downloads: 15600,
      views: 30000,
      authorId: user3.id,
      tags: {
        connect: [
          { id: tags[0].id },
          { id: tags[1].id }
        ]
      }
    }
  })

  console.log('Created configs')

  // Create sample ratings
  await prisma.rating.create({
    data: {
      rating: 5,
      review: 'Amazing config! My FPS went from 60 to 150+ on my mid-range PC.',
      configId: config1.id,
      userId: user2.id
    }
  })

  await prisma.rating.create({
    data: {
      rating: 5,
      review: 'Works perfectly on my potato PC. Finally can play with shaders!',
      configId: config3.id,
      userId: user1.id
    }
  })

  console.log('Created ratings')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
