import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canAccessProFeatures } from '@/lib/access'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isPro = await canAccessProFeatures()
    if (!isPro) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 })
    }

    const { personId } = await params
    const { nextTouchAt, templateId } = await req.json()

    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: {
        lastContactedAt: new Date(),
        nextTouchAt: nextTouchAt ? new Date(nextTouchAt) : null,
      },
    })

    // Log this outreach contact
    await prisma.outreachLog.create({
      data: {
        personId,
        universityId: updatedPerson.universityId,
        templateId: templateId || null,
        sentAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking as contacted:', error)
    return NextResponse.json(
      { error: 'Failed to update' },
      { status: 500 }
    )
  }
}
