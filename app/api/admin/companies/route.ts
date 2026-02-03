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

    const companies = await prisma.company.findMany({
      where: { universityId },
      include: { people: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
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
    const { universityId, tags, ...rest } = data

    const company = await prisma.company.create({
      data: {
        ...rest,
        universityId,
        tags: tags || [],
      },
    })

    return NextResponse.json(company)
  } catch (error: any) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create company' },
      { status: 500 }
    )
  }
}
