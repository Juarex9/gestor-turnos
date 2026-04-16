import { getDatabase } from '../src/lib/mongodb'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ciro.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
  const adminName = process.env.ADMIN_NAME || 'Admin Ciro'
  
  console.log(`Creating admin user: ${adminEmail}`)

  const db = await getDatabase()
  
  // Check if user already exists
  const existingUser = await db.collection('users').findOne({ email: adminEmail })
  
  if (existingUser) {
    console.log('Admin user already exists')
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  
  // Create user
  const userId = new ObjectId()
  const user = {
    _id: userId,
    email: adminEmail,
    name: adminName,
    password: hashedPassword,
    role: 'admin',
    emailVerified: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await db.collection('users').insertOne(user)
  
  // Create NextAuth accounts entry (required for NextAuth adapter)
  await db.collection('accounts').insertOne({
    userId: userId,
    type: 'credentials',
    provider: 'credentials',
    providerAccountId: adminEmail,
    access_token: null,
    refresh_token: null,
    expires_at: null,
    token_type: null,
    scope: null,
    id_token: null,
    session_state: null,
  })

  // Create NextAuth sessions entry
  await db.collection('sessions').insertOne({
    sessionToken: null,
    userId: userId,
    expires: null,
  })

  console.log('Admin user created successfully!')
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${adminPassword}`)
  console.log(`Role: admin`)
}

createAdminUser().catch(console.error)