import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api, { getMe, logout } from './lib/api'

export default function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe()
        setUser(me.user)
      } catch (e) {
        navigate('/login')
      }
    })()
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Hostel Portal</span>
            <Link to="/" className="hover:underline">Dashboard</Link>
            <Link to="/complaints" className="hover:underline">All Complaints</Link>
            <Link to="/resolved" className="hover:underline">Recently Resolved</Link>
            <Link to="/mess" className="hover:underline">Mess</Link>
            <Link to="/bus" className="hover:underline">Bus</Link>
            <Link to="/logs" className="hover:underline">Entry/Exit</Link>
            <Link to="/cleaning" className="hover:underline">Cleaning</Link>
            <Link to="/internet" className="hover:underline">Internet</Link>
            {user.role === 'admin' && <Link to="/admin" className="hover:underline">Admin</Link>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user.name} · {user.role}</span>
            <button className="btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet context={{ user }} />
      </main>
    </div>
  )
}

