import { useState } from 'react';
import Modal from './Modal';

export default function CIDModal({ isOpen, onClose, cid, complaintId }) {
    const [copied, setCopied] = useState(false);

    console.log('CIDModal rendered with:', { isOpen, cid, complaintId });

    const lighthouseUrl = cid ? `https://gateway.lighthouse.storage/ipfs/${cid}` : '';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(cid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleViewOnIPFS = () => {
        if (lighthouseUrl) {
            window.open(lighthouseUrl, '_blank');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Complaint Submitted Successfully!" size="md">
            <div className="space-y-6">
                {/* Success Message */}
                <div className="flex items-center justify-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Your complaint has been successfully submitted and stored on the blockchain.
                    </p>
                </div>

                {/* Complaint ID */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Complaint ID
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        #{complaintId}
                    </p>
                </div>

                {/* CID Display */}
                {cid ? (
                    <div className="space-y-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                                        Lighthouse CID (Content Identifier)
                                    </p>
                                    <div className="bg-white dark:bg-gray-900 rounded px-3 py-2 border border-blue-200 dark:border-blue-700">
                                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                                            {cid}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy CID
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleViewOnIPFS}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View on IPFS
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-1">
                                        Decentralized Storage
                                    </p>
                                    <p className="text-xs text-amber-800 dark:text-amber-400">
                                        Your complaint details are permanently stored on IPFS via Lighthouse.
                                        You can access this data anytime using the CID above.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            Your complaint was saved, but Lighthouse storage is currently unavailable.
                            The complaint has been recorded in our system.
                        </p>
                    </div>
                )}

                {/* Close Button */}
                <div className="pt-4">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

