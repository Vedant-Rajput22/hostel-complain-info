import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function ResolvedComplaints() {
  const [items, setItems] = useState([])
  useEffect(() => { (async()=>{ const { data } = await api.get('/complaints/resolved/recent'); setItems(data.complaints) })() }, [])
  return (
    <div className="card">
      <div className="font-medium mb-2">Recently Resolved</div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-800">
        {items.map(c => (
          <li key={c.complaint_id} className="py-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-gray-500">{c.category} · {new Date(c.resolved_at).toLocaleString()}</div>
            </div>
            <div className="text-sm">Resolved</div>
          </li>
        ))}
        {!items.length && <div className="text-sm text-gray-500">No resolved complaints yet.</div>}
      </ul>
    </div>
  )
}

