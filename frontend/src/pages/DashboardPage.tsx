import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../services/api'
import { AppLayout } from '../components/AppLayout'
import { ConfirmModal } from '../components/ConfirmModal'
import { StatsPanel } from '../components/StatsPanel'

const CATEGORIES = [
  { value: '', label: 'Tous' },
  { value: 'selle', label: 'Selles' },
  { value: 'etrier', label: 'Étriers' },
  { value: 'accessoire', label: 'Accessoires' },
]

const CATEGORY_BADGE: Record<string, string> = {
  selle: 'bg-[#fdf3e8] text-[#b06a10]',
  etrier: 'bg-accent-light text-accent',
  accessoire: 'bg-[#e8f5ee] text-[#1e7e4a]',
}

const CATEGORY_LABELS: Record<string, string> = {
  selle: 'Selle',
  etrier: 'Étrier',
  accessoire: 'Accessoire',
}

export function DashboardPage() {
  const [category, setCategory] = useState('')
  const [inStock, setInStock] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['products', category, inStock],
    queryFn: () => api.getProducts({ category: category || undefined, in_stock: inStock || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setDeleteId(null)
      toast.success('Produit supprimé')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression')
    },
  })

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
      {/* Topbar */}
      <div className="bg-white border-b border-border px-8 h-14 flex items-center justify-between">
        <div className="text-sm text-muted flex items-center gap-2">
          Catalogue <span>›</span> <span className="text-navy font-medium">Produits</span>
        </div>
        <button
          onClick={() => navigate('/products/new')}
          className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-1.5 rounded cursor-pointer transition-colors"
        >
          + Nouveau produit
        </button>
      </div>

      <div className="px-8 py-6">
        <StatsPanel />

        {/* Error */}
        {isError && (
          <div className="bg-danger-bg border border-danger-border text-danger rounded px-4 py-2 mb-4 text-sm">
            Impossible de charger les produits.
          </div>
        )}

        {/* Table card */}
        <div className="bg-white border border-border rounded-md overflow-hidden">

          {/* Filters + Search */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${
                    category === c.value
                      ? 'bg-accent border-accent text-white'
                      : 'border-border text-muted hover:border-accent hover:text-accent'
                  }`}
                >
                  {c.label}
                </button>
              ))}
              <button
                onClick={() => setInStock(!inStock)}
                className={`px-3 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${
                  inStock
                    ? 'bg-accent border-accent text-white'
                    : 'border-border text-muted hover:border-accent hover:text-accent'
                }`}
              >
                En stock
              </button>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit…"
              className="border border-border rounded px-3 py-1.5 text-sm text-navy bg-page outline-none focus:border-accent w-52"
            />
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-page">
                <th className="text-left px-5 py-3 text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted">Produit</th>
                <th className="text-left px-5 py-3 text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted">SKU</th>
                <th className="text-left px-5 py-3 text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted">Catégorie</th>
                <th className="text-right px-5 py-3 text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted">Prix</th>
                <th className="text-right px-5 py-3 text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted">Stock</th>
                <th className="text-right px-5 py-3 text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="h-3.5 bg-border rounded w-4/5 mb-1.5 animate-pulse" />
                      <div className="h-2.5 bg-border rounded w-3/5 animate-pulse" />
                    </td>
                    <td className="px-5 py-3.5"><div className="h-3 bg-border rounded w-4/5 animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-5 bg-border rounded-full w-4/5 animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 bg-border rounded w-4/5 ml-auto animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 bg-border rounded w-4/5 ml-auto animate-pulse" /></td>
                    <td className="px-5 py-3.5"><div className="h-3 bg-border rounded w-4/5 ml-auto animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted text-sm">Aucun produit trouvé.</td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-[#fafbfc] transition-colors">
                    <td className="px-5 py-3.5 max-w-[140px]">
                      <div className="font-medium text-navy text-[0.88rem] truncate">{p.name}</div>
                      {p.description && (
                        <div className="text-muted text-xs font-light mt-0.5 truncate">{p.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[0.72rem] text-muted bg-page px-1.5 py-0.5 rounded">
                        {p.sku}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.68rem] font-medium ${CATEGORY_BADGE[p.category]}`}>
                        {CATEGORY_LABELS[p.category]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-navy tabular-nums">
                      {p.price.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {p.stock === 0
                        ? <span className="inline-block bg-danger-bg text-danger text-[0.7rem] font-medium px-2 py-0.5 rounded">Rupture</span>
                        : <span className="text-navy">{p.stock}</span>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/products/${p.id}/edit`)}
                          className="text-xs text-mid hover:text-navy transition-colors cursor-pointer"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="text-xs text-danger hover:text-red-700 transition-colors cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!isLoading && filtered.length > 0 && (
            <div className="px-5 py-2.5 border-t border-border bg-page flex gap-6">
              <span className="text-xs text-muted">{total} produit{total > 1 ? 's' : ''}</span>
              {outOfStock > 0 && (
                <span className="text-xs text-danger">{outOfStock} rupture{outOfStock > 1 ? 's' : ''} de stock</span>
              )}
            </div>
          )}
        </div>
      </div>

      {deleteId && (
        <ConfirmModal
          message="Supprimer ce produit ?"
          onConfirm={() => deleteMutation.mutate(deleteId)}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </AppLayout>
  )
}
