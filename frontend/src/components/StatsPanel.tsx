import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

export function StatsPanel() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts({}),
  })

  const total = products.length
  const outOfStock = products.filter(p => p.stock === 0).length
  const stockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  const counts = {
    selle: products.filter(p => p.category === 'selle').length,
    etrier: products.filter(p => p.category === 'etrier').length,
    accessoire: products.filter(p => p.category === 'accessoire').length,
  }
  const maxCount = Math.max(counts.selle, counts.etrier, counts.accessoire, 1)

  const bars = [
    { label: 'Selle', count: counts.selle },
    { label: 'Étrier', count: counts.etrier },
    { label: 'Acc.', count: counts.accessoire },
  ]

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">

      {/* Références */}
      <div className="bg-white border border-border rounded-md px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted">Références</span>
          <div className="w-7 h-7 rounded bg-accent-light flex items-center justify-center text-accent text-xs">▤</div>
        </div>
        <div className="text-[1.8rem] leading-none text-navy" style={{ fontFamily: "'DM Serif Display', serif" }}>
          {total}
        </div>
      </div>

      {/* Valeur stock */}
      <div className="bg-white border border-border rounded-md px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted">Valeur stock</span>
          <div className="w-7 h-7 rounded bg-[#e8f5ee] flex items-center justify-center text-[#1e7e4a] text-xs font-semibold">€</div>
        </div>
        <div className="text-[1.8rem] leading-none text-navy" style={{ fontFamily: "'DM Serif Display', serif" }}>
          {stockValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
        </div>
      </div>

      {/* Ruptures */}
      <div className="bg-white border border-border rounded-md px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted">Ruptures</span>
          <div className="w-7 h-7 rounded bg-danger-bg flex items-center justify-center text-danger text-xs font-semibold">!</div>
        </div>
        <div
          className={`text-[1.8rem] leading-none mb-2 ${outOfStock > 0 ? 'text-danger' : 'text-navy'}`}
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          {outOfStock}
        </div>
        <span className="inline-block text-[0.7rem] font-medium bg-page text-muted px-1.5 py-0.5 rounded">
          À réappro.
        </span>
      </div>

      {/* Par catégorie */}
      <div className="bg-white border border-border rounded-md px-5 py-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-muted">Par catégorie</span>
          <div className="w-7 h-7 rounded bg-[#fdf3e8] flex items-center justify-center text-[#b06a10] text-xs">≡</div>
        </div>
        <div className="flex items-end gap-1.5 h-9">
          {bars.map(({ label, count }) => (
            <div key={label} className="relative flex flex-col items-center gap-1 flex-1 group">
              <div
                className="w-full rounded-sm bg-accent/70 cursor-default"
                style={{ height: `${Math.max(4, Math.round((count / maxCount) * 32))}px` }}
              />
              <span className="text-[0.58rem] text-muted">{label}</span>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-navy text-white text-[0.65rem] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {count} produit{count > 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
