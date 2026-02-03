import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { config } from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || config.port

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const USERS_FILE = path.join(__dirname, 'data', 'users.json')
const SESSIONS_FILE = path.join(__dirname, 'data', 'sessions.json')
const DATA_DIR = path.join(__dirname, 'data', 'userdata')

// Ensure data directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'))
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR)
}

// Persistent session store
function getSessions() {
  if (!fs.existsSync(SESSIONS_FILE)) {
    return {}
  }
  try {
    return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = Date.now() + config.sessionDurationHours * 60 * 60 * 1000
  const sessions = getSessions()
  sessions[token] = { userId, expiresAt }
  saveSessions(sessions)
  return token
}

function getSessionUser(token) {
  const sessions = getSessions()
  const session = sessions[token]
  if (!session) return null

  // Check if session expired
  if (Date.now() > session.expiresAt) {
    delete sessions[token]
    saveSessions(sessions)
    return null
  }

  return session.userId
}

function deleteSession(token) {
  const sessions = getSessions()
  delete sessions[token]
  saveSessions(sessions)
}

// Clean up expired sessions periodically
function cleanupExpiredSessions() {
  const sessions = getSessions()
  const now = Date.now()
  let changed = false

  for (const [token, session] of Object.entries(sessions)) {
    if (now > session.expiresAt) {
      delete sessions[token]
      changed = true
    }
  }

  if (changed) {
    saveSessions(sessions)
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000)
cleanupExpiredSessions()

function getUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    return []
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
}

function getUserDataPath(userId) {
  return path.join(DATA_DIR, `${userId}.json`)
}

function getUserData(userId) {
  const dataPath = getUserDataPath(userId)
  if (!fs.existsSync(dataPath)) {
    return null
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
}

function saveUserData(userId, data) {
  const dataPath = getUserDataPath(userId)
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
}

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = getSessionUser(token)
  if (!userId) {
    return res.status(401).json({ error: 'Session expired' })
  }

  req.userId = userId
  next()
}

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const users = getUsers()
  const user = users.find((u) => u.username === username)

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash)
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  // Create persistent session token
  const token = createSession(user.id)

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
  })
})

// Logout endpoint
app.post('/api/logout', authMiddleware, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  deleteSession(token)
  res.json({ success: true })
})

// Get user data
app.get('/api/data', authMiddleware, (req, res) => {
  const data = getUserData(req.userId)
  res.json({ data })
})

// Save user data
app.post('/api/data', authMiddleware, (req, res) => {
  const { data } = req.body
  saveUserData(req.userId, data)
  res.json({ success: true })
})

// Verify token endpoint
app.get('/api/verify', authMiddleware, (req, res) => {
  const users = getUsers()
  const user = users.find((u) => u.id === req.userId)
  if (!user) {
    return res.status(401).json({ error: 'User not found' })
  }
  res.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
  })
})

app.listen(PORT, () => {
  console.log(`Zippy server running on http://localhost:${PORT}`)
  console.log(`Session duration: ${config.sessionDurationHours} hours`)
})
