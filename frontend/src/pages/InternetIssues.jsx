import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function InternetIssues() {
  const [description, setDesc] = useState('')
  const [issues, setIssues] = useState([])
  const [outages, setOutages] = useState([])

  useEffect(()=>{ fetchAll() }, [])

  async function fetchAll() {
    const [{ data: mine }, { data: o }] = await Promise.all([
      api.get('/internet/issues/mine'),
      api.get('/internet/outages')
    ])
    setIssues(mine.issues)
    setOutages(o.outages)
  }

  async function submit(e) {
    e.preventDefault()
    await api.post('/internet/issues', { description })
    setDesc(''); fetchAll()
  }

  return (
    <div className="space-y-4">
      {!!outages.length && (
        <div className="card border-yellow-300 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200">
          <div className="font-medium mb-1">Live Outage Notice</div>
          <ul className="list-disc pl-5 text-sm">
            {outages.map(o => <li key={o.outage_id}>{o.message}</li>)}
          </ul>
        </div>
      )}
      <form onSubmit={submit} className="card flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">Describe the problem</label>
          <input className="input" value={description} onChange={e=>setDesc(e.target.value)} required />
        </div>
        <button className="btn">Report Issue</button>
      </form>
      <div className="card">
        <div className="font-medium mb-2">My Issues</div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {issues.map(i => (
            <li key={i.issue_id} className="py-2 flex justify-between">
              <div className="text-sm">{i.description}</div>
              <div className="text-sm">{i.status}</div>
            </li>
          ))}
          {!issues.length && <div className="text-sm text-gray-500">No issues</div>}
        </ul>
      </div>
    </div>
  )
}

