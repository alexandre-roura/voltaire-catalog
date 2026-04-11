import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { access_token } = await api.login(email, password)
      localStorage.setItem('token', access_token)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center">
      <div className="bg-white border border-border rounded-md shadow-sm p-10 w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8">
          <div
            className="text-navy text-xl tracking-[0.06em]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Voltaire
          </div>
          <div className="text-[0.68rem] tracking-[0.22em] uppercase text-muted mt-0.5 font-light">
            Back-office
          </div>
        </div>

        <div className="mb-6">
          <div className="text-navy font-medium mb-1">Connexion</div>
          <div className="text-sm text-muted font-light">Accédez à la gestion du catalogue</div>
        </div>

        {error && (
          <div className="bg-danger-bg border border-danger-border text-danger rounded px-3 py-2 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[0.72rem] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">
              Email
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@groupevoltaire.com"
              className="w-full border border-border rounded px-3 py-2 text-sm text-navy bg-page outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-[0.72rem] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm text-navy bg-page outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 bg-accent hover:bg-accent-hover disabled:bg-muted text-white rounded py-2.5 text-sm font-medium tracking-[0.04em] cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
