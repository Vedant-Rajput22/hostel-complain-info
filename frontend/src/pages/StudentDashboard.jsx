import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../lib/api'
import ComplaintForm from '../components/ComplaintForm'
import StatusBadge from '../components/StatusBadge'
import { SkeletonCard } from '../components/LoadingSpinner'
import { useToast } from '../contexts/ToastContext'
import ComplaintDetailsModal from '../components/ComplaintDetailsModal'

export default function StudentDashboard() {
  const { user } = useOutletContext()
  const [data, setData] = useState(null)
  const [mine, setMine] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const toast = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, complaintsRes] = await Promise.all([
        api.get('/dashboard/student'),
        api.get('/complaints/mine')
      ])
      setData(dashboardRes.data)
      setMine(complaintsRes.data.complaints)
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleComplaintCreated = () => {
    fetchData()
  }

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailsModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailsModal(false)
    setSelectedComplaint(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 skeleton"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-blue-100 text-sm sm:text-base md:text-lg">
            Manage your complaints and track their status in real-time
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 sm:h-32 w-24 sm:w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-6 sm:-mb-8 -ml-6 sm:-ml-8 h-24 sm:h-32 w-24 sm:w-32 rounded-full bg-indigo-500/20 blur-3xl"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          title="Pending"
          count={data?.counts?.pending ?? 0}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          }
          color="yellow"
          gradient="from-yellow-500 to-orange-500"
        />
        <StatsCard
          title="In Progress"
          count={data?.counts?.in_progress ?? 0}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          }
          color="blue"
          gradient="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Resolved"
          count={data?.counts?.resolved ?? 0}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          }
          color="green"
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      {/* Complaint Form */}
      <ComplaintForm onCreated={handleComplaintCreated} />

      {/* Recent Complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Recent Complaints</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your submitted complaints</p>
          </div>
          {mine.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              {mine.length} total
            </span>
          )}
        </div>

        {mine.length > 0 ? (
          <div className="space-y-3">
            {mine.slice(0, 5).map(c => (
              <div
                key={c.complaint_id}
                onClick={() => handleComplaintClick(c)}
                className="group p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {c.title}
                      </h3>
                      {c.lighthouse_cid && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs font-medium" title="Stored on blockchain">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          CID
                        </span>
                      )}
                      {c.image_url && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Image
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-medium">
                        {c.category}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {c.room_no && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md">
                          Room {c.room_no}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={c.status} type="complaint" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No complaints filed yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              File your first complaint using the form above
            </p>
          </div>
        )}
      </div>

      {/* Complaint Details Modal */}
      <ComplaintDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModal}
        complaint={selectedComplaint}
      />
    </div>
  )
}

// StatsCard Component
function StatsCard({ title, count, icon, color, gradient }) {
  const colors = {
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-600 dark:text-yellow-400',
      icon: 'text-yellow-600 dark:text-yellow-400',
      ring: 'ring-yellow-500/20'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-500/20'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      icon: 'text-green-600 dark:text-green-400',
      ring: 'ring-green-500/20'
    }
  }

  return (
    <div className="group card hover:scale-105 transition-transform duration-200 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors[color].bg} ${colors[color].ring} ring-4 group-hover:scale-110 transition-transform duration-200`}>
          <svg className={`w-7 h-7 ${colors[color].icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className={`text-4xl font-bold ${colors[color].text}`}>{count}</p>
      </div>
      <div className={`h-2 mt-4 rounded-full bg-gradient-to-r ${gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-200`}></div>
    </div>
  )
}

