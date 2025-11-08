import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import api from '../lib/api'

export default function AdminDashboard() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => {
    if (user.role !== 'admin') navigate('/')
    ;(async()=>{
      const { data } = await api.get('/dashboard/admin')
      setData(data)
    })()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card"><div className="text-sm text-gray-500">Total Complaints</div><div className="text-2xl font-bold">{data?.totals?.total ?? 0}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Resolved</div><div className="text-2xl font-bold">{data?.totals?.resolved ?? 0}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Avg Resolution (hrs)</div><div className="text-2xl font-bold">{Number(data?.avgResolution ?? 0).toFixed(1)}</div></div>
      </div>
      <div className="card">
        <div className="font-medium mb-2">Category Breakdown</div>
        <ul>
          {data?.byCategory?.map(c => (
            <li key={c.category} className="flex justify-between py-1"><span>{c.category}</span><span>{c.count}</span></li>
          )) || <div className="text-sm text-gray-500">No data</div>}
        </ul>
      </div>
    </div>
  )
}

