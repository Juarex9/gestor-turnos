import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { parse, isValid, addMinutes, setHours, setMinutes, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface ParsedAppointment {
  clientName: string
  date: Date
  barberName: string
  phone?: string
}

function parseWhatsAppMessage(body: string): ParsedAppointment | null {
  const lines = body.trim().split('\n').map(l => l.trim()).filter(Boolean)
  
  if (lines.length < 2) return null

  let clientName = ''
  let barberName = ''
  let date: Date | null = null

  for (const line of lines) {
    if (line.includes('/') && line.includes(':')) {
      const dateStr = line.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/)?.[1]
      const timeStr = line.match(/(\d{1,2}:\d{2})/)?.[1]
      
      if (dateStr) {
        const [day, month, year] = dateStr.split('/')
        const fullYear = year.length === 2 ? `20${year}` : year
        const parsedDate = parse(`${fullYear}-${month}-${day}`, 'yyyy-MM-dd', new Date())
        
        if (timeStr) {
          const [hours, minutes] = timeStr.split(':').map(Number)
          date = setMinutes(setHours(parsedDate, hours), minutes)
        } else {
          date = setHours(parsedDate, 9)
        }
      }
    } else if (line.toLowerCase().includes('marcos') || 
               line.toLowerCase().includes('lucas') ||
               line.toLowerCase().includes('santiago')) {
      const nameMatch = line.match(/(Marcos|Lucas|Santiago)/i)
      if (nameMatch) barberName = nameMatch[1]
    } else if (!clientName && !line.match(/\d/) && line.length > 2) {
      clientName = line
    }
  }

  if (clientName && date && barberName) {
    return { clientName, date, barberName }
  }

  return null
}

async function findBarber(name: string) {
  const db = await getDatabase()
  const barber = await db.collection('barbers').findOne({ 
    name: { $regex: name, $options: 'i' },
    is_active: true 
  })
  return barber
}

async function checkAvailability(barberId: string, scheduledAt: string, duration: number = 30) {
  const db = await getDatabase()
  const start = new Date(scheduledAt)
  const end = addMinutes(start, duration)

  const overlapping = await db.collection('appointments').find({
    barber_id: barberId,
    status: { $in: ['confirmed', 'pending'] },
    scheduled_at: {
      $lte: end.toISOString(),
      $gte: start.toISOString()
    }
  }).toArray()

  return overlapping.length === 0
}

async function getActiveService() {
  const db = await getDatabase()
  const service = await db.collection('services').findOne({ is_active: true })
  return service
}

async function createAppointment(data: {
  client_name: string
  client_phone?: string
  barber_id: string
  service_id: string
  scheduled_at: string
  status: string
}) {
  const db = await getDatabase()
  const result = await db.collection('appointments').insertOne({
    ...data,
    created_at: new Date()
  })
  return { ...data, _id: result.insertedId }
}

async function sendWhatsAppMessage(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const from = process.env.TWILIO_WHATSAPP_NUMBER
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
  
  if (!accountSid || !from || !twilioAuthToken) {
    console.error('Missing Twilio credentials')
    return false
  }
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${twilioAuthToken}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        From: from,
        To: to,
        Body: body,
      }),
    }
  )
  
  return response.ok
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Unauthorized', { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const entry = body.entry?.[0]?.changes?.[0]?.value
    if (!entry?.messages?.[0]) {
      return NextResponse.json({ received: true })
    }

    const message = entry.messages[0]
    const from = message.from
    const messageBody = message.text?.body

    if (!messageBody) {
      return NextResponse.json({ received: true })
    }

    const parsed = parseWhatsAppMessage(messageBody)

    if (!parsed) {
      await sendWhatsAppMessage(
        from,
        '¡Hola! Para solicitar un turno, por favor indicá:\n' +
        '- Tu nombre\n' +
        '- Fecha y hora (ej: 15/03/2026 14:00)\n' +
        '- Barbero (Marcos, Lucas o Santiago)'
      )
      return NextResponse.json({ received: true })
    }

    const barber = await findBarber(parsed.barberName)

    if (!barber) {
      await sendWhatsAppMessage(
        from,
        `Disculpa, no encontré al barbero "${parsed.barberName}".\n` +
        'Los barberos disponibles son: Marcos, Lucas o Santiago.'
      )
      return NextResponse.json({ received: true })
    }

    const available = await checkAvailability(barber._id.toString(), parsed.date.toISOString())

    if (!available) {
      await sendWhatsAppMessage(
        from,
        `Lo siento, el horario del ${parsed.date.toLocaleDateString('es-AR')} a las ${parsed.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} con ${barber.name} no está disponible.\n` +
        'Por favor, probá con otro horario.'
      )
      return NextResponse.json({ received: true })
    }

    const service = await getActiveService()

    const appointment = await createAppointment({
      client_name: parsed.clientName,
      client_phone: from,
      barber_id: barber._id.toString(),
      service_id: service?._id?.toString() || '',
      scheduled_at: parsed.date.toISOString(),
      status: 'pending',
    })

    if (appointment) {
      await sendWhatsAppMessage(
        from,
        `¡Turno confirmado! 🎉\n\n` +
        `Cliente: ${parsed.clientName}\n` +
        `Barbero: ${barber.name}\n` +
        `Fecha: ${parsed.date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}\n` +
        `Hora: ${parsed.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}\n\n` +
        `Te esperamos en Peluquería Style.`
      )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
