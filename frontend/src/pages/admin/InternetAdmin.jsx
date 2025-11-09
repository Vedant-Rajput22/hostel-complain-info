import { useEffect, useState } from 'react'
import api from '../../lib/api'

const STATUSES = ['Open','In Progress','Resolved']

export default function InternetAdmin() {
  const [issues, setIssues] = useState([])
  const [outages, setOutages] = useState([])
  const [message, setMessage] = useState('')

  useEffect(()=>{ fetchAll() }, [])
  async function fetchAll(){
    const [{ data: is }, { data: out }] = await Promise.all([
      api.get('/internet/issues'),
      api.get('/internet/outages')
    ])
    setIssues(is.issues)
    setOutages(out.outages)
  }
  async function setStatus(id, status){ await api.patch(`/internet/issues/${id}/status`, { status }); fetchAll() }
  async function postOutage(e){ e.preventDefault(); await api.post('/internet/outages', { message }); setMessage(''); fetchAll() }
  async function deactivate(id){ await api.patch(`/internet/outages/${id}/deactivate`); fetchAll() }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="font-medium mb-2">Active Outages</div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {outages.map(o => (
            <li key={o.outage_id} className="py-2 flex justify-between items-center">
              <div>{o.message}</div>
              <button className="btn" onClick={()=>deactivate(o.outage_id)}>Deactivate</button>
            </li>
          ))}
          {!outages.length && <div className="text-sm text-gray-500">No active outages</div>}
        </ul>
        <form onSubmit={postOutage} className="mt-3 flex gap-2">
          <input className="input flex-1" placeholder="New outage message" value={message} onChange={e=>setMessage(e.target.value)} required />
          <button className="btn">Post Outage</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <div className="font-medium mb-2">All Internet Issues</div>
        <table className="w-full text-sm">
          <thead className="text-left"><tr><th className="py-2">Student</th><th>Description</th><th>Status</th></tr></thead>
          <tbody>
            {issues.map(i => (
              <tr key={i.issue_id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="py-2">{i.user_name}</td>
                <td className="max-w-lg truncate" title={i.description}>{i.description}</td>
                <td>
                  <select className="input" value={i.status} onChange={e=>setStatus(i.issue_id, e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!issues.length && <tr><td colSpan={3} className="text-gray-500 py-4">No issues</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

