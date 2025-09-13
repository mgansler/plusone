import { PrismaClient } from './lib/client/client'
import { createAdapter } from './lib/create-adapter'

const prisma = new PrismaClient({ adapter: createAdapter() })

async function main() {
  await prisma.trailArea.upsert({
    where: { name: 'Heslach West' },
    update: {},
    create: {
      name: 'Heslach West',
      latitude: 48.752,
      longitude: 9.129,
      trails: {
        createMany: {
          data: [{ name: 'Klabuster' }, { name: 'Saubuckel' }],
        },
      },
    },
  })
  await prisma.trailArea.upsert({
    where: { name: 'Heslach Ost' },
    update: {},
    create: {
      name: 'Heslach Ost',
      latitude: 48.746,
      longitude: 9.14,
      trails: {
        createMany: {
          data: [{ name: 'Schwälblesklinge' }, { name: 'Geilbahn' }],
        },
      },
    },
  })
  await prisma.trailArea.upsert({
    where: { name: 'Birkenkopf' },
    update: {},
    create: {
      name: 'Birkenkopf',
      latitude: 48.765,
      longitude: 9.135,
      trails: {
        createMany: {
          data: [{ name: 'Mogli' }, { name: 'King Louie' }],
        },
      },
    },
  })
  await prisma.trailArea.upsert({
    where: { name: 'Solitude' },
    update: {},
    create: {
      name: 'Solitude',
      latitude: 48.79,
      longitude: 9.077,
      trails: {
        createMany: {
          data: [{ name: 'Jojo' }, { name: 'Äffle und Pferdle' }],
        },
      },
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
