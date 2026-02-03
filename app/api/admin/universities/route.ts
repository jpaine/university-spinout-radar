import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'

export async function GET() {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const universities = await prisma.university.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(universities)
  } catch (error) {
    console.error('Error fetching universities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch universities' },
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

    const { name, slug } = await req.json()

    const university = await prisma.university.create({
      data: { name, slug },
    })

    return NextResponse.json(university)
  } catch (error: any) {
    console.error('Error creating university:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create university' },
      { status: 500 }
    )
  }
}
