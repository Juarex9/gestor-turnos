import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const db = await getDatabase()
    const barber = await db.collection('barbers').findOne({ _id: new ObjectId(id) })

    if (!barber) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
    }

    return NextResponse.json({ barber })
  } catch (error) {
    console.error('Error fetching barber:', error)
    return NextResponse.json({ error: 'Error fetching barber' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, phone, specialties, is_active } = body

    const db = await getDatabase()
    
    const updateData = {
      name,
      phone,
      specialties,
      is_active,
      updated_at: new Date(),
    }

    const result = await db.collection('barbers').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
    }

    return NextResponse.json({ barber: result })
  } catch (error) {
    console.error('Error updating barber:', error)
    return NextResponse.json({ error: 'Error updating barber' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const db = await getDatabase()

    const result = await db.collection('barbers').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...body, updated_at: new Date() } },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
    }

    return NextResponse.json({ barber: result })
  } catch (error) {
    console.error('Error patching barber:', error)
    return NextResponse.json({ error: 'Error patching barber' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const db = await getDatabase()
    
    const result = await db.collection('barbers').deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting barber:', error)
    return NextResponse.json({ error: 'Error deleting barber' }, { status: 500 })
  }
}