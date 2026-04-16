import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    let settings = await db
      .collection('business_settings')
      .findOne({})

    // Create default settings if none exist
    if (!settings) {
      const defaultSettings = {
        business_name: 'Mi Barbería',
        address: '',
        phone: '',
        email: '',
        opening_time: '09:00',
        closing_time: '20:00',
        work_days: [1, 2, 3, 4, 5],
        slot_duration_minutes: 45,
        require_prepayment: false,
        cancellation_margin_hours: 24,
        whatsapp_number: '',
        created_at: new Date(),
        updated_at: new Date(),
      }
      
      const result = await db.collection('business_settings').insertOne(defaultSettings)
      settings = { ...defaultSettings, _id: result.insertedId }
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      _id,
      business_name,
      address,
      phone,
      email,
      opening_time,
      closing_time,
      work_days,
      slot_duration_minutes,
      require_prepayment,
      cancellation_margin_hours,
      whatsapp_number 
    } = body

    const db = await getDatabase()
    
    const updateData = {
      business_name,
      address,
      phone,
      email,
      opening_time,
      closing_time,
      work_days,
      slot_duration_minutes,
      require_prepayment,
      cancellation_margin_hours,
      whatsapp_number,
      updated_at: new Date(),
    }

    let result

    if (_id) {
      result = await db
        .collection('business_settings')
        .findOneAndUpdate(
          { _id: new (await import('mongodb')).ObjectId(_id) },
          { $set: updateData },
          { returnDocument: 'after' }
        )
    } else {
      const existingSettings = await db
        .collection('business_settings')
        .findOne({})

      if (existingSettings) {
        result = await db
          .collection('business_settings')
          .findOneAndUpdate(
            { _id: existingSettings._id },
            { $set: updateData },
            { returnDocument: 'after' }
          )
      } else {
        const newSettings = {
          ...updateData,
          created_at: new Date(),
        }
        const insertResult = await db
          .collection('business_settings')
          .insertOne(newSettings)
        result = { ...newSettings, _id: insertResult.insertedId }
      }
    }

    return NextResponse.json({ settings: result })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
  }
}