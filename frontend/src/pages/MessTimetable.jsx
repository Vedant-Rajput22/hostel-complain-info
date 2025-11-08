import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function MessTimetable() {
  const [items, setItems] = useState([])
  useEffect(() => { (async()=>{ const { data } = await api.get('/mess'); setItems(data.timetable) })() }, [])
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const meals = ['Breakfast','Lunch','Snacks','Dinner']
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Weekly Mess Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {days.map(d => (
          <div key={d} className="card">
            <div className="font-medium mb-2">{d}</div>
            <ul className="space-y-1">
              {meals.map(m => {
                const row = items.find(i => i.day_of_week === d && i.meal_type === m)
                return <li key={m}><span className="text-sm text-gray-500 w-24 inline-block">{m}:</span> <span>{row?.menu_items || '—'}</span></li>
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

