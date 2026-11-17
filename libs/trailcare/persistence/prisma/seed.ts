import { CareType, PrismaClient } from '../src/lib/client/client'
import { createAdapter } from '../src/lib/create-adapter'

const prisma = new PrismaClient({ adapter: createAdapter() })

async function main() {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  // Seed categories if not yet present
  const categories = await Promise.all([
    prisma.careNeedCategory.upsert({
      where: { name: 'VEGETATION' },
      update: {},
      create: { name: 'VEGETATION', description: 'Vegetation' },
    }),
    prisma.careNeedCategory.upsert({
      where: { name: 'SHAPING' },
      update: {},
      create: { name: 'SHAPING', description: 'Shapen' },
    }),
    prisma.careNeedCategory.upsert({
      where: { name: 'DRAINAGE' },
      update: {},
      create: { name: 'DRAINAGE', description: 'Entwässerung' },
    }),
    prisma.careNeedCategory.upsert({
      where: { name: 'OTHER' },
      update: {},
      create: { name: 'OTHER', description: 'Sonstiges' },
    }),
  ])

  const byName = Object.fromEntries(categories.map((c) => [c.name, c.id]))

  await prisma.trailArea.upsert({
    where: { name: 'Heslach' },
    update: {},
    create: {
      name: 'Heslach',
      trails: {
        create: [
          {
            name: 'Klabuster',
            careEntries: {
              create: [
                { type: CareType.SWEPT, performedAt: yesterday },
                { type: CareType.INSPECTION, performedAt: threeDaysAgo },
              ],
            },
            careNeeds: {
              create: [
                {
                  categoryId: byName['VEGETATION'],
                  description: 'Seitenäste am Kilometerstein 2 zurückneiden',
                },
              ],
            },
          },
          {
            name: 'Saubuckel',
            aliases: { create: [{ name: 'Sauböckle' }] },
            careEntries: {
              create: [{ type: CareType.SWEPT, performedAt: threeDaysAgo }],
            },
          },
          {
            name: 'Schwälblesklinge',
            careNeeds: {
              create: [
                {
                  categoryId: byName['DRAINAGE'],
                  description: 'Graben bei der Kurve nach Süden reinigen',
                },
                {
                  categoryId: byName['SHAPING'],
                  description: 'Steilkurve neu machen',
                },
              ],
            },
          },
        ],
      },
    },
  })

  await prisma.trailArea.upsert({
    where: { name: 'Solitude' },
    update: {},
    create: {
      name: 'Solitude',
      trails: {
        create: [
          {
            name: 'Jojo',
            aliases: { create: [{ name: 'Yoyo' }] },
            careEntries: {
              create: [
                { type: CareType.SWEPT, performedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000) },
                { type: CareType.FALLEN_TREE, performedAt: now },
              ],
            },
          },
          {
            name: 'Rundweg',
            careEntries: {
              create: [{ type: CareType.SWEPT, performedAt: yesterday }],
            },
          },
        ],
      },
    },
  })

  await prisma.trailArea.upsert({
    where: { name: 'Schlossgarten' },
    update: {},
    create: {
      name: 'Schlossgarten',
      trails: {
        create: [
          {
            name: 'Parkpfad',
            careEntries: {
              create: [{ type: CareType.SWEPT, performedAt: yesterday }],
            },
            careNeeds: {
              create: [
                {
                  categoryId: byName['VEGETATION'],
                  description: 'Hecke am Eingang zurück schneiden',
                },
              ],
            },
          },
          {
            name: 'Teichrunde',
            aliases: { create: [{ name: 'Teichweg' }] },
            careEntries: {
              create: [
                { type: CareType.SWEPT, performedAt: yesterday },
                { type: CareType.CUT_BACK, performedAt: threeDaysAgo },
              ],
            },
          },
        ],
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
