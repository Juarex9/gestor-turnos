import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role = 'employee' } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password y nombre son requeridos' },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const userId = new ObjectId()
    const user = {
      _id: userId,
      email,
      name,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('users').insertOne(user)

    // Create NextAuth account entry (required for adapter)
    await db.collection('accounts').insertOne({
      userId: userId,
      type: 'credentials',
      provider: 'credentials',
      providerAccountId: email,
      access_token: null,
      refresh_token: null,
      expires_at: null,
      token_type: null,
      scope: null,
      id_token: null,
      session_state: null,
    })

    return NextResponse.json({ success: true, userId: userId.toString() })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Error al crear la cuenta' },
      { status: 500 }
    )
  }
}