import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const barber_id = searchParams.get('barber_id')

    const db = await getDatabase()
    
    const query: Record<string, unknown> = {}
    
    if (start && end) {
      query.scheduled_at = {
        $gte: new Date(start),
        $lte: new Date(end),
      }
    }
    
    if (barber_id) {
      query.barber_id = barber_id
    }

    const appointments = await db
      .collection('appointments')
      .find(query)
      .sort({ scheduled_at: 1 })
      .toArray()

    // Fetch related barbers and services
    const barberIds = Array.from(new Set(appointments.map(a => a.barber_id)))
    const serviceIds = Array.from(new Set(appointments.map(a => a.service_id)))

    const [barbers, services] = await Promise.all([
      db.collection('barbers').find({ _id: { $in: barberIds } }).toArray(),
      db.collection('services').find({ _id: { $in: serviceIds } }).toArray(),
    ])

    const barbersMap = new Map(barbers.map(b => [b._id.toString(), b]))
    const servicesMap = new Map(services.map(s => [s._id.toString(), s]))

    const appointmentsWithRelations = appointments.map(a => ({
      ...a,
      barber: barbersMap.get(a.barber_id?.toString()),
      service: servicesMap.get(a.service_id?.toString()),
    }))

    return NextResponse.json({ appointments: appointmentsWithRelations })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Error fetching appointments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { client_name, client_phone, barber_id, service_id, scheduled_at, status = 'pending', notes } = body

    if (!client_name || !barber_id || !service_id || !scheduled_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = await getDatabase()
    
    const appointment = {
      client_name,
      client_phone: client_phone || null,
      barber_id,
      service_id,
      scheduled_at: new Date(scheduled_at),
      status,
      notes: notes || null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection('appointments').insertOne(appointment)
    
    return NextResponse.json({ appointment: { ...appointment, _id: result.insertedId } })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Error creating appointment' }, { status: 500 })
  }
}