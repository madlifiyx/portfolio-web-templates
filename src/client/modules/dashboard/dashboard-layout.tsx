import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { getSession, logout } from './api'
import { DashboardProvider, useDashboard } from './dashboard-context'

const links = [
  ['Overview', '/dashboard'],
  ['Profile', '/dashboard/profile'],
  ['Experience', '/dashboard/experience'],
  ['Skills', '/dashboard/skills'],
  ['Projects', '/dashboard/projects'],
  ['Contacts', '/dashboard/contacts'],
  ['Platforms', '/dashboard/platforms'],
  ['Media', '/dashboard/media'],
  ['Preview', '/dashboard/preview'],
] as const

const DashboardOutlet = () => {
  const { draft, loading, message, reload } = useDashboard()
  if (loading) return <p>Loading draft...</p>
  if (!draft) {
    return (
      <div role="alert">
        <p>{message || 'Draft could not be loaded.'}</p>
        <button type="button" className="mt-3 rounded-md border px-3 py-2" onClick={reload}>
          Retry
        </button>
      </div>
    )
  }
  return <Outlet />
}

export const DashboardLayout = () => {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getSession()
      .then(() => setReady(true))
      .catch(() => navigate('/login', { replace: true }))
  }, [navigate])

  if (!ready) return <main className="mx-auto max-w-5xl p-8">Checking session...</main>

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <header className="border-b bg-background">
          <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
            <strong>Portfolio Dashboard</strong>
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm"
              onClick={() => logout().then(() => navigate('/login'))}
            >
              Log out
            </button>
          </div>
        </header>
        <div className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[220px_1fr]">
          <nav className="flex gap-2 overflow-auto md:flex-col" aria-label="Dashboard">
            {links.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <main className="min-w-0 rounded-xl border bg-background p-5 shadow-sm">
            <DashboardOutlet />
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}
