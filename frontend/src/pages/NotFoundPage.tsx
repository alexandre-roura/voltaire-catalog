import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-page flex items-center justify-center">
      <div className="text-center">
        <div
          className="text-[9rem] leading-none text-navy/8 select-none font-bold tracking-tighter mb-6"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          404
        </div>
        <div
          className="text-navy text-xl mb-2"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Page introuvable
        </div>
        <p className="text-muted text-sm mb-8 font-light">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded cursor-pointer transition-colors"
        >
          Retour au catalogue
        </button>
      </div>
    </div>
  )
}
