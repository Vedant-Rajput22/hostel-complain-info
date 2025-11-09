import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function CleaningAdmin() {
  const [items, setItems] = useState([])
  const [staff, setStaff] = useState([])

  useEffect(()=>{ fetchAll(); fetchStaff() }, [])
  async function fetchAll(){ const { data } = await api.get('/cleaning/all'); setItems(data.requests) }
  async function fetchStaff(){ const { data } = await api.get('/users'); setStaff((data.users||[]).filter(u=>u.role==='staff')) }
  async function assign(id, assigned_to){ await api.patch(`/cleaning/${id}/assign`, { assigned_to }); fetchAll() }
  async function complete(id){ await api.patch(`/cleaning/${id}/complete`); fetchAll() }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left"><tr><th className="py-2">Room</th><th>Student</th><th>Description</th><th>Assigned</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(r => (
            <tr key={r.request_id} className="border-t border-gray-200 dark:border-gray-800">
              <td className="py-2">{r.room_no}</td>
              <td>{r.user_name}</td>
              <td className="max-w-lg truncate" title={r.description}>{r.description}</td>
              <td>
                <select className="input" value={r.assigned_to || ''} onChange={e=>assign(r.request_id, e.target.value || null)}>
                  <option value="">Unassigned</option>
                  {staff.map(s => <option key={s.user_id} value={s.user_id}>{s.name}</option>)}
                </select>
              </td>
              <td>{r.status}</td>
              <td>
                {r.status !== 'Completed' && <button className="btn" onClick={()=>complete(r.request_id)}>Mark Complete</button>}
              </td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={6} className="text-gray-500 py-4">No requests</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

