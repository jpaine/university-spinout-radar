import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const data = await req.json()
    const { tags, otherUrls, companyId, ...rest } = data

    const person = await prisma.person.update({
      where: { id },
      data: {
        ...rest,
        tags: tags || [],
        otherUrls: otherUrls || [],
        companyId: companyId || null,
      },
    })

    return NextResponse.json(person)
  } catch (error: any) {
    console.error('Error updating person:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update person' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    await prisma.person.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting person:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete person' },
      { status: 500 }
    )
  }
}
