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
    
    const appointment = await db.collection('appointments').findOne({ _id: new ObjectId(id) })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Fetch related barber and service
    const [barber, service] = await Promise.all([
      appointment.barber_id ? db.collection('barbers').findOne({ _id: new ObjectId(appointment.barber_id) }) : null,
      appointment.service_id ? db.collection('services').findOne({ _id: new ObjectId(appointment.service_id) }) : null,
    ])

    return NextResponse.json({ 
      appointment: { 
        ...appointment, 
        barber, 
        service 
      } 
    })
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json({ error: 'Error fetching appointment' }, { status: 500 })
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
    const { client_name, client_phone, barber_id, service_id, scheduled_at, status, notes } = body

    const db = await getDatabase()
    
    const updateData = {
      ...(client_name && { client_name }),
      ...(client_phone !== undefined && { client_phone }),
      ...(barber_id && { barber_id }),
      ...(service_id && { service_id }),
      ...(scheduled_at && { scheduled_at: new Date(scheduled_at) }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      updated_at: new Date(),
    }

    const result = await db.collection('appointments').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const appointment = result as any

    // Fetch related data
    const [barber, service] = await Promise.all([
      appointment.barber_id ? db.collection('barbers').findOne({ _id: new ObjectId(appointment.barber_id) }) : null,
      appointment.service_id ? db.collection('services').findOne({ _id: new ObjectId(appointment.service_id) }) : null,
    ])

    return NextResponse.json({ 
      appointment: { 
        ...appointment, 
        barber, 
        service 
      } 
    })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Error updating appointment' }, { status: 500 })
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

    // Handle special fields
    const updateData: Record<string, unknown> = { updated_at: new Date() }
    
    if (body.scheduled_at) {
      updateData.scheduled_at = new Date(body.scheduled_at)
    }
    
    Object.keys(body).forEach(key => {
      if (key !== 'scheduled_at') {
        updateData[key] = body[key]
      }
    })

    const result = await db.collection('appointments').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const appointment = result as any

    // Fetch related data
    const [barber, service] = await Promise.all([
      appointment.barber_id ? db.collection('barbers').findOne({ _id: new ObjectId(appointment.barber_id) }) : null,
      appointment.service_id ? db.collection('services').findOne({ _id: new ObjectId(appointment.service_id) }) : null,
    ])

    return NextResponse.json({ 
      appointment: { 
        ...result, 
        barber, 
        service 
      } 
    })
  } catch (error) {
    console.error('Error patching appointment:', error)
    return NextResponse.json({ error: 'Error patching appointment' }, { status: 500 })
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
    
    const result = await db.collection('appointments').deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: 'Error deleting appointment' }, { status: 500 })
  }
}