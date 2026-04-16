import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const barbers = await db
      .collection('barbers')
      .find({ is_active: true })
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({ barbers })
  } catch (error) {
    console.error('Error fetching barbers:', error)
    return NextResponse.json({ error: 'Error fetching barbers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, is_active = true } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const db = await getDatabase()
    
    const barber = {
      name,
      is_active,
      created_at: new Date(),
    }

    const result = await db.collection('barbers').insertOne(barber)
    
    return NextResponse.json({ barber: { ...barber, _id: result.insertedId } })
  } catch (error) {
    console.error('Error creating barber:', error)
    return NextResponse.json({ error: 'Error creating barber' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { _id, name, phone, specialties, is_active } = body

    if (!_id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const db = await getDatabase()
    
    const updateData: Record<string, unknown> = {
      name,
      phone,
      specialties,
      is_active,
      updated_at: new Date(),
    }

    await db.collection('barbers').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating barber:', error)
    return NextResponse.json({ error: 'Error updating barber' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const db = await getDatabase()
    
    await db.collection('barbers').deleteOne({ _id: new ObjectId(id) })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting barber:', error)
    return NextResponse.json({ error: 'Error deleting barber' }, { status: 500 })
  }
}