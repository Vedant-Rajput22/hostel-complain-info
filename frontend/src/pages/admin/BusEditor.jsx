import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function BusEditor() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ route_name:'', start_time:'', end_time:'', stops:'' })
  const [saving, setSaving] = useState(false)

  useEffect(()=>{ fetchAll() }, [])
  async function fetchAll(){ const { data } = await api.get('/bus'); setItems(data.timetable) }

  async function addEntry(e){
    e.preventDefault()
    setSaving(true)
    const entries = [{ ...form, stops: form.stops.split(',').map(s=>s.trim()).filter(Boolean) }]
    await api.put('/bus', { entries })
    setForm({ route_name:'', start_time:'', end_time:'', stops:'' })
    await fetchAll()
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addEntry} className="card grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
        <div>
          <label className="block text-sm mb-1">Route</label>
          <input className="input" value={form.route_name} onChange={e=>setForm({...form, route_name:e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Start</label>
          <input className="input" type="time" value={form.start_time} onChange={e=>setForm({...form, start_time:e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm mb-1">End</label>
          <input className="input" type="time" value={form.end_time} onChange={e=>setForm({...form, end_time:e.target.value})} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Stops (comma-separated)</label>
          <input className="input" value={form.stops} onChange={e=>setForm({...form, stops:e.target.value})} required />
        </div>
        <button className="btn" disabled={saving}>{saving?'Adding...':'Add Route'}</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left"><tr><th className="py-2">Route</th><th>Start</th><th>End</th><th>Stops</th></tr></thead>
          <tbody>
            {items.map(b => (
              <tr key={b.bus_id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="py-2">{b.route_name}</td>
                <td>{b.start_time}</td>
                <td>{b.end_time}</td>
                <td>{Array.isArray(b.stops) ? b.stops.join(' → ') : (()=>{ try { return (JSON.parse(b.stops)||[]).join(' → ')} catch { return b.stops } })()}</td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={4} className="text-gray-500 py-4">No routes</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

