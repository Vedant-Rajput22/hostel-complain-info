import { useState } from 'react'
import api from '../lib/api'

export default function ComplaintForm({ onCreated }) {
  const [form, setForm] = useState({ category:'Mess', title:'', description:'', room_no:'', floor:'', block:'' })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const categories = ['Mess','Lift','Room/Floor Appliances','Internet/Wi-Fi','Washroom','Water','Room Cleaning']

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v])=> fd.append(k, v))
      if (image) fd.append('image', image)
      const { data } = await api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onCreated?.(data)
      setForm({ category:'Mess', title:'', description:'', room_no:'', floor:'', block:'' })
      setImage(null)
    } catch (e) {
      setError(e.error || 'Failed to file complaint')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select className="input" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Title</label>
          <input className="input" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Description</label>
        <textarea className="input" rows={3} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Room No</label>
          <input className="input" value={form.room_no} onChange={e=>setForm({...form, room_no:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm mb-1">Floor</label>
          <input className="input" value={form.floor} onChange={e=>setForm({...form, floor:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm mb-1">Block</label>
          <input className="input" value={form.block} onChange={e=>setForm({...form, block:e.target.value})} />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Image (optional)</label>
        <input type="file" onChange={(e)=>setImage(e.target.files?.[0])} />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button className="btn" disabled={loading}>{loading? 'Submitting...' : 'Submit Complaint'}</button>
    </form>
  )
}

