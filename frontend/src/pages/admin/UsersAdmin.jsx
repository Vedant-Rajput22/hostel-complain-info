import { useEffect, useState } from 'react'
import api from '../../lib/api'

const ROLES = ['student','staff','admin']

export default function UsersAdmin() {
  const [users, setUsers] = useState([])
  useEffect(()=>{ fetchUsers() }, [])
  async function fetchUsers() {
    const { data } = await api.get('/users')
    setUsers(data.users)
  }
  async function updateRole(id, role) {
    await api.patch(`/users/${id}/role`, { role })
    fetchUsers()
  }
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left"><tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Room</th><th>Joined</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.user_id} className="border-t border-gray-200 dark:border-gray-800">
              <td className="py-2">{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select className="input" value={u.role} onChange={e=>updateRole(u.user_id, e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
              <td>{u.hostel_block || '-'} {u.room_no || ''}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {!users.length && <tr><td colSpan={5} className="text-gray-500 py-4">No users</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

