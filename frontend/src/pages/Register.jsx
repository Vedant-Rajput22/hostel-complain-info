import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../lib/api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hostel_block, setHostelBlock] = useState('')
  const [room_no, setRoomNo] = useState('')
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMsg(null)
    try {
      const res = await register({ name, email, password, hostel_block, room_no })
      setMsg(res.message + (res.verify_url ? ` (Verify: ${res.verify_url})` : ''))
    } catch (e) {
      setError(e.error || e.errors?.[0]?.msg || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Create account</h1>
        {msg && <div className="text-green-600 text-sm">{msg}</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">College Email</label>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@iiitn.ac.in" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Block</label>
            <input className="input" value={hostel_block} onChange={e=>setHostelBlock(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Room No</label>
            <input className="input" value={room_no} onChange={e=>setRoomNo(e.target.value)} />
          </div>
        </div>
        <button className="btn w-full" type="submit">Register</button>
        <div className="text-sm text-gray-500">Already have an account? <Link className="underline" to="/login">Login</Link></div>
      </form>
    </div>
  )
}

