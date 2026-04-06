const API_URL = import.meta.env.VITE_API_URL || '/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Non authentifié')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `Erreur ${response.status}`)
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

export const api = {
  login: async (email: string, password: string): Promise<{ access_token: string }> => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    const response = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      body: form,
    })
    if (!response.ok) throw new Error('Email ou mot de passe incorrect')
    return response.json()
  },

  getProducts: (params?: { category?: string; in_stock?: boolean }) => {
    const query = new URLSearchParams()
    if (params?.category) query.append('category', params.category)
    if (params?.in_stock) query.append('in_stock', 'true')
    const qs = query.toString()
    return request<Product[]>(`/products${qs ? `?${qs}` : ''}`)
  },

  getProduct: (id: string) => request<Product>(`/products/${id}`),

  createProduct: (data: ProductCreate) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),

  updateProduct: (id: string, data: Partial<ProductCreate>) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),
}

export interface Product {
  id: string
  name: string
  category: 'selle' | 'etrier' | 'accessoire'
  sku: string
  description?: string
  price: number
  stock: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface ProductCreate {
  name: string
  category: 'selle' | 'etrier' | 'accessoire'
  sku: string
  description?: string
  price: number
  stock: number
  image_url?: string
}
