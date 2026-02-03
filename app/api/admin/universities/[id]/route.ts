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
    const { name, slug } = await req.json()

    const university = await prisma.university.update({
      where: { id },
      data: { name, slug },
    })

    return NextResponse.json(university)
  } catch (error: any) {
    console.error('Error updating university:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update university' },
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

    await prisma.university.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting university:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete university' },
      { status: 500 }
    )
  }
}
