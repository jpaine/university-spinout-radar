import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'

export async function GET(req: NextRequest) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const universityId = searchParams.get('universityId')

    if (!universityId) {
      return NextResponse.json({ error: 'universityId is required' }, { status: 400 })
    }

    const people = await prisma.person.findMany({
      where: { universityId },
      include: { company: true },
      orderBy: { lastName: 'asc' },
    })

    return NextResponse.json(people)
  } catch (error) {
    console.error('Error fetching people:', error)
    return NextResponse.json(
      { error: 'Failed to fetch people' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const data = await req.json()
    const { universityId, tags, otherUrls, companyId, ...rest } = data

    const person = await prisma.person.create({
      data: {
        ...rest,
        universityId,
        tags: tags || [],
        otherUrls: otherUrls || [],
        companyId: companyId || null,
      },
    })

    return NextResponse.json(person)
  } catch (error: any) {
    console.error('Error creating person:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create person' },
      { status: 500 }
    )
  }
}
