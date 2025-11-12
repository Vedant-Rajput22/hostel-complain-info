import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'
import CIDModal from './CIDModal'

export default function ComplaintForm({ onCreated }) {
  const [form, setForm] = useState({ category: 'Mess', title: '', description: '', room_no: '', floor: '', block: '' })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showCIDModal, setShowCIDModal] = useState(false)
  const [complaintResult, setComplaintResult] = useState(null)
  const toast = useToast()

  // Open modal when complaintResult is set
  useEffect(() => {
    if (complaintResult) {
      console.log('useEffect: Opening modal with result:', complaintResult)
      setShowCIDModal(true)
    }
  }, [complaintResult])

  const categories = ['Mess', 'Lift', 'Room/Floor Appliances', 'Internet/Wi-Fi', 'Washroom', 'Water', 'Room Cleaning']

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    setImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (form.title.length > 200) newErrors.title = 'Title must be less than 200 characters'
    return newErrors
  }

  const handleModalClose = () => {
    console.log('Closing modal and resetting form')
    setShowCIDModal(false)
    setComplaintResult(null)
    // Reset form after modal closes
    setForm({ category: 'Mess', title: '', description: '', room_no: '', floor: '', block: '' })
    setImage(null)
    setImagePreview(null)
  }

  async function submit(e) {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (image) fd.append('image', image)
      const { data } = await api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } })

      console.log('Complaint submitted successfully! Response:', data)
      console.log('lighthouse_cid:', data.lighthouse_cid)
      console.log('complaint_id:', data.complaint_id)

      // Don't show toast - modal will show success
      // toast.success('Complaint submitted successfully!')
      onCreated?.(data)

      // Store the result - useEffect will open the modal
      setComplaintResult(data)
      console.log('Complaint result set, useEffect should trigger')
    } catch (e) {
      toast.error(e.error || 'Failed to file complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={submit} className="card space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">File a Complaint</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Report an issue and we'll address it promptly</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm mb-1 font-medium">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1 font-medium">Title *</label>
            <input
              className={`input ${errors.title ? 'input-error' : ''}`}
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Brief description of the issue"
              required
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Description</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Provide more details about the issue..."
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm mb-1 font-medium">Room No</label>
            <input className="input" value={form.room_no} onChange={e => setForm({ ...form, room_no: e.target.value })} placeholder="e.g., 101" />
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">Floor</label>
            <input className="input" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} placeholder="e.g., 1st" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm mb-1 font-medium">Block</label>
            <input className="input" value={form.block} onChange={e => setForm({ ...form, block: e.target.value })} placeholder="e.g., A" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Image (optional)</label>
          {!imagePreview ? (
            <div className="mt-1">
              <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                <span className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-medium text-gray-600">
                    Drop image here or click to upload
                  </span>
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          ) : (
            <div className="relative mt-2">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-md" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>
        </div>

        <button className="btn w-full py-3 text-base" type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting your complaint...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Submit Complaint
            </span>
          )}
        </button>
      </form>

      {/* CID Modal */}
      <CIDModal
        isOpen={showCIDModal}
        onClose={handleModalClose}
        cid={complaintResult?.lighthouse_cid}
        complaintId={complaintResult?.complaint_id}
      />
    </>
  )
}

