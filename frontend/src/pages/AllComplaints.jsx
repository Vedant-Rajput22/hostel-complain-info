import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function AllComplaints() {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ q: '', category:'', status:'' })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data } = await api.get('/complaints/all', { params: filters })
    setItems(data.complaints)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className="input" placeholder="Search" value={filters.q} onChange={e=>setFilters({...filters, q: e.target.value})} />
        <select className="input" value={filters.category} onChange={e=>setFilters({...filters, category:e.target.value})}>
          <option value="">All Categories</option>
          {['Mess','Lift','Room/Floor Appliances','Internet/Wi-Fi','Washroom','Water','Room Cleaning'].map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={filters.status} onChange={e=>setFilters({...filters, status:e.target.value})}>
          <option value="">Any Status</option>
          {['Pending','In Progress','Resolved'].map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn" onClick={fetchData}>Apply</button>
      </div>
      <div className="card">
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {items.map(c => (
            <li key={c.complaint_id} className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{c.title} <span className="text-xs text-gray-500">· {c.category}</span></div>
                <div className="text-xs text-gray-500">By {c.user_name} · {new Date(c.created_at).toLocaleString()}</div>
              </div>
              <div className="text-sm">{c.status}</div>
            </li>
          ))}
          {!items.length && <div className="text-sm text-gray-500">No complaints found.</div>}
        </ul>
      </div>
    </div>
  )
}

