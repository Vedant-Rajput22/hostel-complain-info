import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function BusTimetable() {
  const [items, setItems] = useState([])
  useEffect(() => { (async()=>{ const { data } = await api.get('/bus'); setItems(data.timetable) })() }, [])
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bus / Transport Timetable</h2>
      <div className="card">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr><th className="py-2">Route</th><th>Start</th><th>End</th><th>Stops</th></tr>
          </thead>
          <tbody>
            {items.map(b => (
              <tr key={b.bus_id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="py-2">{b.route_name}</td>
                <td>{b.start_time}</td>
                <td>{b.end_time}</td>
                <td>{Array.isArray(b.stops) ? b.stops.join(' → ') : (()=>{ try { return (JSON.parse(b.stops)||[]).join(' → ')} catch { return b.stops } })()}</td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={4} className="text-gray-500 py-4">No data</td></tr>}
          </tbody>
        </table>
      </div>
      <button className="btn" onClick={() => window.print()}>Print/Download</button>
    </div>
  )
}

