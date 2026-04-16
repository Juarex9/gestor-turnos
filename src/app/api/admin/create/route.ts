import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const currentUser = await db.collection('users').findOne({ email: session.user.email })

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
      return NextResponse.json(
        { error: 'Solo administradores pueden crear usuarios' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password, fullName, role } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' },
        { status: 400 }
      )
    }

    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = new ObjectId()
    const user = {
      _id: userId,
      email,
      name: fullName || email.split('@')[0],
      password: hashedPassword,
      role: role || 'employee',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('users').insertOne(user)

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

    return NextResponse.json({
      success: true,
      userId: userId.toString(),
      email,
      name: fullName || email.split('@')[0],
      role: role || 'employee',
    })
  } catch (error) {
    console.error('Admin create error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}