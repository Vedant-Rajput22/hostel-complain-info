import { useState } from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import dayjs from 'dayjs';

export default function ComplaintDetailsModal({ isOpen, onClose, complaint }) {
    const [copied, setCopied] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!complaint) return null;

    const handleCopyCID = async () => {
        if (!complaint.lighthouse_cid) return;
        try {
            await navigator.clipboard.writeText(complaint.lighthouse_cid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy CID:', err);
        }
    };

    const handleViewOnIPFS = () => {
        if (complaint.lighthouse_cid) {
            window.open(`https://gateway.lighthouse.storage/ipfs/${complaint.lighthouse_cid}`, '_blank');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Complaint Details" size="lg">
            <div className="space-y-6">
                {/* Header with ID and Status */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Complaint #{complaint.complaint_id}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Filed on {dayjs(complaint.created_at).format('MMM D, YYYY [at] h:mm A')}
                        </p>
                    </div>
                    <StatusBadge status={complaint.status} />
                </div>

                {/* Category */}
                <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{complaint.category}</p>
                </div>

                {/* Title */}
                <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</label>
                    <p className="mt-1 text-lg text-gray-900 dark:text-white">{complaint.title}</p>
                </div>

                {/* Description */}
                {complaint.description && (
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                        <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{complaint.description}</p>
                    </div>
                )}

                {/* Location Details */}
                {(complaint.room_no || complaint.floor || complaint.block) && (
                    <div className="grid grid-cols-3 gap-4">
                        {complaint.room_no && (
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Room No</label>
                                <p className="mt-1 text-gray-900 dark:text-white">{complaint.room_no}</p>
                            </div>
                        )}
                        {complaint.floor && (
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Floor</label>
                                <p className="mt-1 text-gray-900 dark:text-white">{complaint.floor}</p>
                            </div>
                        )}
                        {complaint.block && (
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Block</label>
                                <p className="mt-1 text-gray-900 dark:text-white">{complaint.block}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Image */}
                {complaint.image_url && !imageError && (
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Attached Image</label>
                        <img
                            src={complaint.image_url}
                            alt="Complaint"
                            className="w-full max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                            onError={() => setImageError(true)}
                        />
                    </div>
                )}

                {/* Lighthouse CID */}
                {complaint.lighthouse_cid && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <label className="text-sm font-medium text-blue-900 dark:text-blue-300 block mb-2">
                            Lighthouse CID (Blockchain Storage)
                        </label>
                        <div className="bg-white dark:bg-gray-900 rounded px-3 py-2 border border-blue-200 dark:border-blue-700 mb-3">
                            <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                                {complaint.lighthouse_cid}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopyCID}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy CID
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleViewOnIPFS}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View on IPFS
                            </button>
                        </div>
                    </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                        <p className="mt-1 text-gray-900 dark:text-white">
                            {dayjs(complaint.created_at).format('MMM D, YYYY h:mm A')}
                        </p>
                    </div>
                    {complaint.resolved_at && (
                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved At</label>
                            <p className="mt-1 text-gray-900 dark:text-white">
                                {dayjs(complaint.resolved_at).format('MMM D, YYYY h:mm A')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Rating */}
                {complaint.rating && (
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Rating</label>
                        <div className="mt-1 flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-5 h-5 ${star <= complaint.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                {complaint.rating}/5
                            </span>
                        </div>
                    </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

