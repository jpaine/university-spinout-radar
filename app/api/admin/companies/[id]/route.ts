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
    const { tags, ...rest } = data

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...rest,
        tags: tags || [],
      },
    })

    return NextResponse.json(company)
  } catch (error: any) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update company' },
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

    await prisma.company.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete company' },
      { status: 500 }
    )
  }
}
