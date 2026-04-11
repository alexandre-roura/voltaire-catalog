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
  price: z.number().min(0, 'Le prix doit être positif'),
  stock: z.number().int().min(0, 'Le stock doit être positif'),
  image_url: z.url('URL invalide').optional().or(z.literal('')),
})

type FormErrors = Partial<Record<keyof ProductCreate, string>>

const CATEGORIES: { value: ProductCreate['category']; label: string }[] = [
  { value: 'selle', label: 'Selle' },
  { value: 'etrier', label: 'Étrier' },
  { value: 'accessoire', label: 'Accessoire' },
]

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
        description: result.data.description || null,
        image_url: result.data.image_url || null,
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
    return `w-full border rounded px-3 py-2 text-sm text-navy bg-white outline-none transition-colors ${
      fieldErrors[key] ? 'border-danger' : 'border-border focus:border-accent'
    } ${extra}`
  }

  return (
    <AppLayout>
      {/* Topbar */}
      <div className="bg-white border-b border-border px-8 h-14 flex items-center justify-between">
        <div className="text-sm text-muted flex items-center gap-2">
          Catalogue <span>›</span> Produits <span>›</span>
          <span className="text-navy font-medium">
            {isEdit ? form.name || 'Modifier' : 'Nouveau produit'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-1.5 text-sm border border-border text-mid hover:text-navy rounded transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            form="product-form"
            type="submit"
            disabled={saving}
            className="bg-accent hover:bg-accent-hover disabled:bg-muted text-white text-sm font-medium px-4 py-1.5 rounded cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le produit'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-muted text-sm">Chargement…</div>
      ) : (
        <div className="flex flex-1 overflow-hidden h-full">

          {/* Left — form */}
          <div className="flex-1 overflow-y-auto px-8 py-6">

            {error && (
              <div className="bg-danger-bg border border-danger-border text-danger rounded px-4 py-2 mb-5 text-sm">
                {error}
              </div>
            )}

            <div
              className="text-navy text-xl mb-6"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
            </div>

            <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Identité */}
              <div>
                <div className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted pb-2.5 border-b border-border mb-4">
                  Identité
                </div>
                <div className="grid grid-cols-[1fr_160px] gap-4 mb-4">
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
                </div>

                <div>
                  <label className="block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted mb-1.5">
                    Catégorie
                  </label>
                  <div className="flex gap-2">
                    {CATEGORIES.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => set('category', c.value)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                          form.category === c.value
                            ? c.value === 'selle'
                              ? 'bg-[#fdf3e8] text-[#b06a10] border-0'
                              : c.value === 'etrier'
                              ? 'bg-accent-light text-accent border-0'
                              : 'bg-[#e8f5ee] text-[#1e7e4a] border-0'
                            : 'border border-border text-muted hover:text-navy bg-white'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          form.category === c.value
                            ? c.value === 'selle' ? 'bg-[#b06a10]' : c.value === 'etrier' ? 'bg-accent' : 'bg-[#1e7e4a]'
                            : 'border border-border'
                        }`} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prix & Stock */}
              <div>
                <div className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted pb-2.5 border-b border-border mb-4">
                  Prix & Stock
                </div>
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
              </div>

              {/* Description */}
              <div>
                <div className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted pb-2.5 border-b border-border mb-4">
                  Description <span className="normal-case tracking-normal font-normal">(optionnel)</span>
                </div>
                <textarea
                  value={form.description ?? ''}
                  onChange={e => set('description', e.target.value)}
                  rows={5}
                  placeholder="Description du produit…"
                  className={fieldClass('description', 'resize-none')}
                />
              </div>
            </form>
          </div>

          {/* Right — image panel */}
          <div className="w-64 shrink-0 border-l border-border bg-white flex flex-col p-5">
            <div className="text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted pb-2.5 border-b border-border mb-4">
              Image produit
            </div>

            {/* Preview */}
            <div className="aspect-square bg-page border-2 border-dashed border-border rounded-md mb-4 relative overflow-hidden">
              {form.image_url ? (
                <>
                  <img
                    src={form.image_url}
                    alt="Aperçu"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs font-medium truncate">
                    {form.name || '—'}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl text-border">⊕</span>
                  <span className="text-xs text-muted">Aucune image</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted mb-1.5">
                URL de l'image
              </label>
              <input
                type="text"
                value={form.image_url ?? ''}
                onChange={e => set('image_url', e.target.value)}
                placeholder="https://…"
                className="w-full border border-border rounded px-3 py-2 text-xs text-navy bg-page outline-none focus:border-accent"
              />
              {fieldErrors.image_url && <p className="text-danger text-xs mt-1">{fieldErrors.image_url}</p>}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
