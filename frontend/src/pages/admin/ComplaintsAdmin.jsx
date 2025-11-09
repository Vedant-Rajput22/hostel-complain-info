import { useEffect, useState } from 'react'
import api from '../../lib/api'

const STATUSES = ['Pending','In Progress','Resolved']
const CATEGORIES = ['Mess','Lift','Room/Floor Appliances','Internet/Wi-Fi','Washroom','Water','Room Cleaning']

export default function ComplaintsAdmin() {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ q:'', category:'', status:'' })
  const [staff, setStaff] = useState([])

  useEffect(() => { fetchAll(); fetchStaff() }, [])

  async function fetchAll() {
    const { data } = await api.get('/complaints/all', { params: filters })
    setItems(data.complaints)
  }
  async function fetchStaff() {
    const { data } = await api.get('/users')
    setStaff((data.users||[]).filter(u=>u.role==='staff'))
  }
  async function assign(id, assigned_to) {
    await api.patch(`/complaints/${id}/assign`, { assigned_to })
    fetchAll()
  }
  async function setStatus(id, status) {
    await api.patch(`/complaints/${id}/status`, { status })
    fetchAll()
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <input className="input" placeholder="Search" value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})} />
        <select className="input" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>
          <option value="">Any Status</option>
          {STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn" onClick={fetchAll}>Apply</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr>
              <th className="py-2">Title</th>
              <th>Category</th>
              <th>By</th>
              <th>Assigned</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(c => (
              <tr key={c.complaint_id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="py-2 min-w-[240px]">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-gray-500 max-w-lg truncate">{c.description}</div>
                </td>
                <td>{c.category}</td>
                <td className="min-w-[160px]">{c.user_name}</td>
                <td>
                  <select className="input" value={c.assigned_to || ''} onChange={e=>assign(c.complaint_id, e.target.value || null)}>
                    <option value="">Unassigned</option>
                    {staff.map(s => <option key={s.user_id} value={s.user_id}>{s.name}</option>)}
                  </select>
                </td>
                <td>
                  <select className="input" value={c.status} onChange={e=>setStatus(c.complaint_id, e.target.value)}>
                    {STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  {c.image_url && <a className="underline" href={c.image_url} target="_blank">Image</a>}
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={6} className="text-gray-500 py-4">No complaints</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

