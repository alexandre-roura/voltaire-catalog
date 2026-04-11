import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { api } from '../services/api'
import type { ProductCreate } from '../services/api'
import { AppLayout } from '../components/AppLayout'

const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  category: z.enum(['selle', 'etrier', 'accessoire']),
  sku: z.string().min(1, 'Le SKU est requis'),
  description: z.string().optional(),
  price: z.number({ invalid_type_error: 'Prix invalide' }).min(0, 'Le prix doit être positif'),
  stock: z.number({ invalid_type_error: 'Stock invalide' }).int().min(0, 'Le stock doit être positif'),
  image_url: z.url('URL invalide').optional().or(z.literal('')),
})

type FormErrors = Partial<Record<keyof ProductCreate, string>>

const EMPTY: ProductCreate = {
  name: '',
  category: 'selle',
  sku: '',
  description: '',
  price: 0,
  stock: 0,
  image_url: '',
}

export function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<ProductCreate>(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!id) return
    api.getProduct(id).then(p => {
      setForm({
        name: p.name,
        category: p.category,
        sku: p.sku,
        description: p.description ?? '',
        price: p.price,
        stock: p.stock,
        image_url: p.image_url ?? '',
      })
      setLoading(false)
    }).catch(() => {
      setError('Produit introuvable.')
      setLoading(false)
    })
  }, [id])

  function set<K extends keyof ProductCreate>(key: K, value: ProductCreate[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setFieldErrors(prev => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const result = productSchema.safeParse(form)
    if (!result.success) {
      const errors: FormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProductCreate
        if (!errors[key]) errors[key] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    setSaving(true)
    try {
      const payload: ProductCreate = {
        ...result.data,
        description: result.data.description || undefined,
        image_url: result.data.image_url || undefined,
      }
      if (isEdit && id) {
        await api.updateProduct(id, payload)
      } else {
        await api.createProduct(payload)
      }
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(isEdit ? 'Produit mis à jour' : 'Produit créé')
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  function fieldClass(key: keyof ProductCreate, extra = '') {
    return `w-full border rounded px-3 py-2 text-sm text-navy bg-page outline-none transition-colors ${
      fieldErrors[key] ? 'border-danger' : 'border-border focus:border-accent'
    } ${extra}`
  }

  return (
    <AppLayout>
      <div className="px-8 py-7 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={() => navigate('/')}
            className="text-muted hover:text-navy transition-colors cursor-pointer text-sm"
          >
            ← Catalogue
          </button>
          <span className="text-border">/</span>
          <h1 className="text-navy text-xl font-semibold tracking-tight">
            {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
        </div>

        {error && (
          <div className="bg-danger-bg border border-danger-border text-danger rounded px-4 py-2 mb-5 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted text-sm">Chargement…</p>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-border rounded-md p-6 flex flex-col gap-5">

            {/* Nom */}
            <div>
              <label className="block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted mb-1.5">
                Nom du produit
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Blue Infinite"
                className={fieldClass('name')}
              />
              {fieldErrors.name && <p className="text-danger text-xs mt-1">{fieldErrors.name}</p>}
            </div>

            {/* SKU + Catégorie */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted mb-1.5">
                  SKU
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={e => set('sku', e.target.value)}
                  placeholder="VLT-SEL-001"
                  className={fieldClass('sku', 'font-mono')}
                />
                {fieldErrors.sku && <p className="text-danger text-xs mt-1">{fieldErrors.sku}</p>}
              </div>
              <div>
                <label className="block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted mb-1.5">
                  Catégorie
                </label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value as ProductCreate['category'])}
                  className={fieldClass('category', 'cursor-pointer')}
                >
                  <option value="selle">Selle</option>
                  <option value="etrier">Étrier</option>
                  <option value="accessoire">Accessoire</option>
                </select>
              </div>
            </div>

            {/* Prix + Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted mb-1.5">
                  Prix (€)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={e => set('price', parseFloat(e.target.value) || 0)}
                  className={fieldClass('price')}
                />
                {fieldErrors.price && <p className="text-danger text-xs mt-1">{fieldErrors.price}</p>}
              </div>
              <div>
                <label className="block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted mb-1.5">
                  Stock
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={e => set('stock', parseInt(e.target.value) || 0)}
                  className={fieldClass('stock')}
                />
                {fieldErrors.stock && <p className="text-danger text-xs mt-1">{fieldErrors.stock}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted mb-1.5">
                Description <span className="normal-case tracking-normal font-normal">(optionnel)</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                placeholder="Description du produit…"
                className={fieldClass('description', 'resize-none')}
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted mb-1.5">
                URL image <span className="normal-case tracking-normal font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={form.image_url}
                onChange={e => set('image_url', e.target.value)}
                placeholder="https://…"
                className={fieldClass('image_url')}
              />
              {fieldErrors.image_url && <p className="text-danger text-xs mt-1">{fieldErrors.image_url}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm text-mid hover:text-navy transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-accent hover:bg-accent-hover disabled:bg-muted text-white text-sm font-medium px-5 py-2 rounded cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le produit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  )
}
