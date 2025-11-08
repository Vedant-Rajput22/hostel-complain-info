import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function EntryExitLogs() {
  const [logs, setLogs] = useState([])
  const [action, setAction] = useState('entry')
  const [reason, setReason] = useState('')

  useEffect(()=>{ fetchLogs() }, [])

  async function fetchLogs() {
    const { data } = await api.get('/logs')
    setLogs(data.logs)
  }

  async function submit(e) {
    e.preventDefault()
    await api.post('/logs', { action, reason })
    setReason('')
    fetchLogs()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="card flex gap-2 items-end">
        <div>
          <label className="block text-sm mb-1">Action</label>
          <select className="input" value={action} onChange={e=>setAction(e.target.value)}>
            <option value="entry">Entry</option>
            <option value="exit">Exit</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Reason</label>
          <input className="input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Optional" />
        </div>
        <button className="btn">Log</button>
      </form>
      <div className="card">
        <div className="font-medium mb-2">History</div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {logs.map(l => (
            <li key={l.log_id} className="py-2 flex justify-between">
              <div>
                <div className="font-medium">{l.action}</div>
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

