import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../lib/api'
import ComplaintForm from '../components/ComplaintForm'

export default function StudentDashboard() {
  const { user } = useOutletContext()
  const [data, setData] = useState(null)
  const [mine, setMine] = useState([])

  useEffect(() => {
    ;(async ()=>{
      const { data } = await api.get('/dashboard/student')
      setData(data)
      const { data: mineRes } = await api.get('/complaints/mine')
      setMine(mineRes.complaints)
    })()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card"><div className="text-sm text-gray-500">Pending</div><div className="text-2xl font-bold">{data?.counts?.pending ?? 0}</div></div>
        <div className="card"><div className="text-sm text-gray-500">In Progress</div><div className="text-2xl font-bold">{data?.counts?.in_progress ?? 0}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Resolved</div><div className="text-2xl font-bold">{data?.counts?.resolved ?? 0}</div></div>
      </div>

      <ComplaintForm onCreated={()=>{
        api.get('/complaints/mine').then(({data})=> setMine(data.complaints))
      }} />

      <div className="card">
        <div className="font-medium mb-2">My Recent Complaints</div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {mine.slice(0,5).map(c=> (
            <li key={c.complaint_id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-gray-500">{c.category} · {new Date(c.created_at).toLocaleString()}</div>
              </div>
              <div className="text-sm">{c.status}</div>
            </li>
          ))}
          {!mine.length && <div className="text-sm text-gray-500">No complaints yet.</div>}
        </ul>
      </div>
    </div>
  )
}

