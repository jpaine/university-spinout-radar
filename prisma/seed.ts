import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

async function main() {
  console.log('Seeding database...')

  // Create Oxford University
  const oxford = await prisma.university.upsert({
    where: { slug: 'oxford' },
    update: {},
    create: {
      slug: 'oxford',
      name: 'University of Oxford',
    },
  })

  console.log('Created Oxford University')

  // Create sample companies
  const company1 = await prisma.company.upsert({
    where: {
      universityId_slug: {
        universityId: oxford.id,
        slug: 'deepmind',
      },
    },
    update: {},
    create: {
      universityId: oxford.id,
      slug: 'deepmind',
      name: 'DeepMind',
      description: 'AI research company',
      website: 'https://deepmind.com',
      linkedinUrl: 'https://linkedin.com/company/deepmind',
      tags: ['AI', 'Machine Learning'],
      segment: 'Enterprise',
      newThisWeek: false,
    },
  })

  const company2 = await prisma.company.upsert({
    where: {
      universityId_slug: {
        universityId: oxford.id,
        slug: 'oxford-robotics',
      },
    },
    update: {},
    create: {
      universityId: oxford.id,
      slug: 'oxford-robotics',
      name: 'Oxford Robotics Institute',
      description: 'Robotics research and development',
      website: 'https://ori.ox.ac.uk',
      tags: ['Robotics', 'AI-enabled robotics'],
      segment: 'Research',
      newThisWeek: true,
    },
  })

  console.log('Created sample companies')

  // Create sample people
  const person1 = await prisma.person.upsert({
    where: {
      universityId_slug: {
        universityId: oxford.id,
        slug: 'john-smith',
      },
    },
    update: {},
    create: {
      universityId: oxford.id,
      companyId: company1.id,
      slug: 'john-smith',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@deepmind.com',
      linkedinUrl: 'https://linkedin.com/in/johnsmith',
      tags: ['AI', 'Machine Learning'],
      segment: 'Enterprise',
      newThisWeek: false,
    },
  })

  const person2 = await prisma.person.upsert({
    where: {
      universityId_slug: {
        universityId: oxford.id,
        slug: 'jane-doe',
      },
    },
    update: {},
    create: {
      universityId: oxford.id,
      companyId: company2.id,
      slug: 'jane-doe',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@ori.ox.ac.uk',
      linkedinUrl: 'https://linkedin.com/in/janedoe',
      profileUrl: 'https://ori.ox.ac.uk/people/jane-doe',
      tags: ['Robotics', 'AI-enabled robotics'],
      segment: 'Research',
      newThisWeek: true,
      nextTouchAt: new Date(), // Due for contact
    },
  })

  console.log('Created sample people')

  // Create sample templates
  const existingTemplates = await prisma.template.findMany({
    where: { universityId: oxford.id },
  })

  if (existingTemplates.length === 0) {
    await prisma.template.createMany({
      data: [
        {
          universityId: oxford.id,
          name: 'Initial Outreach',
          subject: 'Partnership Opportunity - University Spinout',
          body: `Dear {{firstName}},

I hope this email finds you well. I'm reaching out regarding a potential partnership opportunity with {{companyName}}.

We are interested in exploring how we might collaborate on {{topic}}.

Would you be available for a brief call next week?

Best regards,
[Your Name]`,
        },
        {
          universityId: oxford.id,
          name: 'Follow-up',
          subject: 'Following up on our previous conversation',
          body: `Hi {{firstName}},

I wanted to follow up on our previous conversation about {{topic}}.

Please let me know if you have any questions or would like to schedule a follow-up call.

Best regards,
[Your Name]`,
        },
      ],
    })
  }

  console.log('Created sample templates')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
