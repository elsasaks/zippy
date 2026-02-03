const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface AuthUser {
  id: string
  username: string
  displayName: string
}

interface LoginResponse {
  token: string
  user: AuthUser
}

interface DataResponse {
  data: unknown | null
}

class ApiClient {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem('zippy_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }

  async login(username: string, password: string): Promise<AuthUser> {
    const response = await this.request<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })

    this.token = response.token
    localStorage.setItem('zippy_token', response.token)
    return response.user
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/logout', { method: 'POST' })
    } catch {
      // Ignore logout errors
    }
    this.token = null
    localStorage.removeItem('zippy_token')
  }

  async verifyToken(): Promise<AuthUser | null> {
    if (!this.token) return null

    try {
      const response = await this.request<{ user: AuthUser }>('/api/verify')
      return response.user
    } catch {
      this.token = null
      localStorage.removeItem('zippy_token')
      return null
    }
  }

  async getData(): Promise<unknown | null> {
    const response = await this.request<DataResponse>('/api/data')
    return response.data
  }

  async saveData(data: unknown): Promise<void> {
    await this.request('/api/data', {
      method: 'POST',
      body: JSON.stringify({ data }),
    })
  }

  isAuthenticated(): boolean {
    return !!this.token
  }
}

export const api = new ApiClient()
export type { AuthUser }
