import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function LogsAdmin() {
  const [logs, setLogs] = useState([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [userId, setUserId] = useState('')
  const [users, setUsers] = useState([])

  useEffect(()=>{ fetchUsers(); fetchLogs() }, [])

  async function fetchUsers(){ const { data } = await api.get('/users'); setUsers(data.users) }
  async function fetchLogs(){ const { data } = await api.get('/logs', { params: { from: from || undefined, to: to || undefined, user_id: userId || undefined } }); setLogs(data.logs) }

  async function exportCSV(){
    const { data: blob } = await api.get('/logs/export', { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'entry_exit_logs.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      <div className="card grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div>
          <label className="block text-sm mb-1">From</label>
          <input className="input" type="datetime-local" value={from} onChange={e=>setFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">To</label>
          <input className="input" type="datetime-local" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">User</label>
          <select className="input" value={userId} onChange={e=>setUserId(e.target.value)}>
            <option value="">Any</option>
            {users.map(u => <option key={u.user_id} value={u.user_id}>{u.name} ({u.email})</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={fetchLogs}>Apply</button>
          <button className="btn" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="card">
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {logs.map(l => (
            <li key={l.log_id} className="py-2 flex justify-between items-center">
              <div>
                <div className="font-medium">{l.user_name} · {l.action}</div>
                <div className="text-xs text-gray-500">{l.reason || '—'}</div>
              </div>
              <div className="text-xs text-gray-500">{new Date(l.timestamp).toLocaleString()}</div>
            </li>
          ))}
          {!logs.length && <div className="text-sm text-gray-500">No logs</div>}
        </ul>
      </div>
    </div>
  )
}

