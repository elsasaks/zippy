import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const USERS_FILE = path.join(__dirname, 'data', 'users.json')

async function createUser(username, password, displayName) {
  const saltRounds = 12
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = {
    id: crypto.randomUUID(),
    username,
    passwordHash,
    displayName,
    createdAt: new Date().toISOString(),
  }

  let users = []
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
  }

  // Check if user already exists
  const existingIndex = users.findIndex((u) => u.username === username)
  if (existingIndex >= 0) {
    users[existingIndex] = user
    console.log(`Updated user: ${username}`)
  } else {
    users.push(user)
    console.log(`Created user: ${username}`)
  }

  // Ensure data directory exists
  const dataDir = path.dirname(USERS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  console.log(`User saved to ${USERS_FILE}`)
}

// Get args: node setup-user.js <username> <password> <displayName>
const args = process.argv.slice(2)
if (args.length < 3) {
  console.log('Usage: node setup-user.js <username> <password> <displayName>')
  console.log('Example: node setup-user.js elsa mypassword "Elsa Saks"')
  process.exit(1)
}

createUser(args[0], args[1], args[2])
