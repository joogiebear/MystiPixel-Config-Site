import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting cleanup...')

  // Delete all supported versions
  const deletedVersions = await prisma.supportedVersion.deleteMany({})
  console.log(`Deleted ${deletedVersions.count} supported versions`)

  // Delete all game modes
  const deletedGameModes = await prisma.gameMode.deleteMany({})
  console.log(`Deleted ${deletedGameModes.count} game modes`)

  console.log('Cleanup completed! You can now add versions and game modes through the admin panel.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
