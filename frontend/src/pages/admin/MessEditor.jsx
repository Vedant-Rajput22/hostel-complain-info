import { useEffect, useState } from 'react'
import api from '../../lib/api'

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const meals = ['Breakfast','Lunch','Snacks','Dinner']

export default function MessEditor() {
  const [data, setData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(()=>{ (async()=>{ const { data } = await api.get('/mess'); const map = {}; (data.timetable||[]).forEach(r=>{ map[`${r.day_of_week}-${r.meal_type}`]=r.menu_items }) ; setData(map) })() }, [])

  function setCell(day, meal, val){ setData(prev => ({ ...prev, [`${day}-${meal}`]: val })) }

  async function save() {
    setSaving(true)
    const items = []
    for (const d of days){ for (const m of meals){ items.push({ day_of_week: d, meal_type: m, menu_items: data[`${d}-${m}`] || '' }) } }
    await api.put('/mess', { items })
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {days.map(d => (
          <div key={d} className="card">
            <div className="font-medium mb-2">{d}</div>
            <div className="space-y-2">
              {meals.map(m => (
                <div key={m} className="flex items-center gap-2">
                  <div className="w-24 text-sm text-gray-500">{m}</div>
                  <input className="input flex-1" value={data[`${d}-${m}`] || ''} onChange={e=>setCell(d,m,e.target.value)} placeholder="Comma-separated items" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="btn" onClick={save} disabled={saving}>{saving?'Saving...':'Save Menu'}</button>
    </div>
  )
}

