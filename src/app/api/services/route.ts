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
    const services = await db
      .collection('services')
      .find({ is_active: true })
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, price, duration_minutes, is_active = true } = body

    if (!name || !price || !duration_minutes) {
      return NextResponse.json({ error: 'Name, price and duration are required' }, { status: 400 })
    }

    const db = await getDatabase()
    
    const service = {
      name,
      price,
      duration_minutes,
      is_active,
      created_at: new Date(),
    }

    const result = await db.collection('services').insertOne(service)
    
    return NextResponse.json({ service: { ...service, _id: result.insertedId } })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Error creating service' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { _id, name, price, duration_minutes, description, is_active } = body

    if (!_id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const db = await getDatabase()
    
    const updateData: Record<string, unknown> = {
      name,
      price,
      duration_minutes,
      description,
      is_active,
      updated_at: new Date(),
    }

    await db.collection('services').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Error updating service' }, { status: 500 })
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
    
    await db.collection('services').deleteOne({ _id: new ObjectId(id) })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Error deleting service' }, { status: 500 })
  }
}