import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function CleaningRequests() {
  const [room_no, setRoom] = useState('')
  const [description, setDesc] = useState('')
  const [items, setItems] = useState([])

  useEffect(()=>{ fetchMine() }, [])

  async function fetchMine() {
    const { data } = await api.get('/cleaning/mine')
    setItems(data.requests)
  }

  async function submit(e) {
    e.preventDefault()
    await api.post('/cleaning', { room_no, description })
    setRoom(''); setDesc('')
    fetchMine()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="card grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm mb-1">Room No</label>
          <input className="input" value={room_no} onChange={e=>setRoom(e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Description</label>
          <input className="input" value={description} onChange={e=>setDesc(e.target.value)} />
        </div>
        <button className="btn">Request Cleaning</button>
      </form>
      <div className="card">
        <div className="font-medium mb-2">My Requests</div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {items.map(r => (
            <li key={r.request_id} className="py-2 flex justify-between">
              <div>
                <div className="font-medium">{r.room_no}</div>
                <div className="text-xs text-gray-500">{r.description || '—'}</div>
              </div>
              <div className="text-sm">{r.status}</div>
            </li>
          ))}
          {!items.length && <div className="text-sm text-gray-500">No requests</div>}
        </ul>
      </div>
    </div>
  )
}

