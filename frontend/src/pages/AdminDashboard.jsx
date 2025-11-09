import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import api from '../lib/api'
import ComplaintsAdmin from './admin/ComplaintsAdmin'
import UsersAdmin from './admin/UsersAdmin'
import MessEditor from './admin/MessEditor'
import BusEditor from './admin/BusEditor'
import LogsAdmin from './admin/LogsAdmin'
import CleaningAdmin from './admin/CleaningAdmin'
import InternetAdmin from './admin/InternetAdmin'

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'complaints', label: 'Complaints' },
  { key: 'users', label: 'Users' },
  { key: 'mess', label: 'Mess' },
  { key: 'bus', label: 'Bus' },
  { key: 'logs', label: 'Logs' },
  { key: 'cleaning', label: 'Cleaning' },
  { key: 'internet', label: 'Internet' },
]

export default function AdminDashboard() {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (user.role !== 'admin') navigate('/')
    ;(async()=>{
      const { data } = await api.get('/dashboard/admin')
      setData(data)
    })()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      </div>
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} className={`px-3 py-1 rounded-md border ${tab===t.key?'bg-blue-600 text-white border-blue-600':'border-gray-300 dark:border-gray-700'}`} onClick={()=>setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
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
      )}

      {tab === 'complaints' && <ComplaintsAdmin />}
      {tab === 'users' && <UsersAdmin />}
      {tab === 'mess' && <MessEditor />}
      {tab === 'bus' && <BusEditor />}
      {tab === 'logs' && <LogsAdmin />}
      {tab === 'cleaning' && <CleaningAdmin />}
      {tab === 'internet' && <InternetAdmin />}
    </div>
  )
}
