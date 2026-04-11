import { NavLink, useNavigate } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Catalogue', icon: '⊞' },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-navy flex flex-col">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-navy-mid">
          <div
            className="text-white text-lg tracking-[0.06em]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Voltaire
          </div>
          <div className="text-[0.62rem] tracking-[0.22em] uppercase text-muted mt-0.5 font-light">
            Back-office
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-white hover:bg-navy-mid'
                }`
              }
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-navy-mid">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-muted hover:text-white hover:bg-navy-mid transition-colors cursor-pointer"
          >
            <span className="text-base leading-none">→</span>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-page overflow-auto">
        {children}
      </main>
    </div>
  )
}
