import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import type { Product } from '../services/api'
import { AppLayout } from '../components/AppLayout'

const CATEGORIES = [
  { value: '', label: 'Tous' },
  { value: 'selle', label: 'Selles' },
  { value: 'etrier', label: 'Étriers' },
  { value: 'accessoire', label: 'Accessoires' },
]

const CATEGORY_LABELS: Record<string, string> = {
  selle: 'Selle',
  etrier: 'Étrier',
  accessoire: 'Accessoire',
}

export function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('')
  const [inStock, setInStock] = useState(false)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    load()
  }, [category, inStock])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await api.getProducts({
        category: category || undefined,
        in_stock: inStock || undefined,
      })
      setProducts(data)
    } catch {
      setError('Impossible de charger les produits.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    setDeleting(id)
    try {
      await api.deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch {
      setError('Erreur lors de la suppression.')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = search.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      )
    : products

  const total = filtered.length
  const outOfStock = filtered.filter(p => p.stock === 0).length

  return (
    <AppLayout>
      <div className="px-8 py-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-navy text-xl font-semibold tracking-tight">Catalogue produits</h1>
            <p className="text-sm text-muted font-light mt-0.5">{total} produit{total > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => navigate('/products/new')}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded cursor-pointer transition-colors"
          >
            + Nouveau produit
          </button>
        </div>

        {/* Filters + Search */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-white border border-border rounded p-1">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                    category === c.value
                      ? 'bg-navy text-white'
                      : 'text-mid hover:text-navy'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStock}
                onChange={e => setInStock(e.target.checked)}
                className="accent-accent w-4 h-4"
              />
              <span className="text-sm text-mid">En stock uniquement</span>
            </label>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou SKU…"
            className="border border-border rounded px-3 py-2 text-sm text-navy bg-white outline-none focus:border-accent w-64"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-danger-bg border border-danger-border text-danger rounded px-4 py-2 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-page">
                <th className="text-left px-4 py-3 text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted">Nom</th>
                <th className="text-left px-4 py-3 text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted">SKU</th>
                <th className="text-left px-4 py-3 text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted">Catégorie</th>
                <th className="text-right px-4 py-3 text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted">Prix</th>
                <th className="text-right px-4 py-3 text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted text-sm">
                    Chargement…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted text-sm">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-page transition-colors">
                    <td className="px-4 py-3 text-navy font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-mid font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-accent-light text-accent">
                        {CATEGORY_LABELS[p.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-navy">{p.price.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.stock === 0 ? 'text-danger font-medium' : 'text-navy'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/products/${p.id}/edit`)}
                          className="text-xs text-mid hover:text-navy transition-colors cursor-pointer"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="text-xs text-danger hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deleting === p.id ? '…' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Footer stats */}
          {!loading && products.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border bg-page flex gap-6">
              <span className="text-xs text-muted">{total} produit{total > 1 ? 's' : ''}</span>
              {outOfStock > 0 && (
                <span className="text-xs text-danger">{outOfStock} rupture{outOfStock > 1 ? 's' : ''} de stock</span>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
