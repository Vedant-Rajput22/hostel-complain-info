import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import GoogleSignInButton from '../components/GoogleSignInButton'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hostel_block, setHostelBlock] = useState('')
  const [room_no, setRoomNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await register({ name, email, password, hostel_block, room_no })
      toast.success(res.message || 'Registration successful! Please check your email to verify.')
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (e) {
      toast.error(e.error || e.errors?.[0]?.msg || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Hostel Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 shadow-xl">
          <h2 className="text-xl font-semibold text-center">Create Account</h2>

          {/* Google Sign-In */}
          <GoogleSignInButton text="Sign up with Google" />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                Or register with email
              </span>
            </div>
          </div>

          {success && (
            <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 rounded-md text-green-800 dark:text-green-200 text-sm">
              ✓ Registration successful! Redirecting to login...
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">College Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@iiitn.ac.in" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                className="input pr-10"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              At least 8 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Hostel Block</label>
              <input
                className="input"
                value={hostel_block}
                onChange={e => setHostelBlock(e.target.value)}
                placeholder="e.g., A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room No</label>
              <input
                className="input"
                value={room_no}
                onChange={e => setRoomNo(e.target.value)}
                placeholder="e.g., 101"
              />
            </div>
          </div>

          <button className="btn w-full" type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>

          <div className="text-sm text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link className="text-blue-600 hover:text-blue-700 font-medium" to="/login">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

