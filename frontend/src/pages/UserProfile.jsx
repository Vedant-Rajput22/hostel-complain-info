import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UserProfile() {
    const { user: currentUser } = useOutletContext();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        hostel_block: '',
        room_no: '',
    });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                hostel_block: currentUser.hostel_block || '',
                room_no: currentUser.room_no || '',
            });
        }
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.patch('/auth/profile', {
                name: formData.name,
                hostel_block: formData.hostel_block,
                room_no: formData.room_no,
            });

            toast.success('Profile updated successfully!');
            setIsEditing(false);

            // Refresh the page to get updated user data
            window.location.reload();
        } catch (error) {
            toast.error(error.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            hostel_block: currentUser.hostel_block || '',
            room_no: currentUser.room_no || '',
        });
        setIsEditing(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    My Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage your account information
                </p>
            </div>

            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-secondary"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={!isEditing}
                            className={`input ${!isEditing ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="input bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Hostel Block</label>
                            <input
                                type="text"
                                value={formData.hostel_block}
                                onChange={(e) => setFormData({ ...formData, hostel_block: e.target.value })}
                                disabled={!isEditing}
                                className={`input ${!isEditing ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                                placeholder="e.g., A"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Room Number</label>
                            <input
                                type="text"
                                value={formData.room_no}
                                onChange={(e) => setFormData({ ...formData, room_no: e.target.value })}
                                disabled={!isEditing}
                                className={`input ${!isEditing ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                                placeholder="e.g., 101"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn flex-1"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <LoadingSpinner size="sm" />
                                        Saving...
                                    </span>
                                ) : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="btn btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold mb-4">Account Details</h2>
                <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                        <span className="text-gray-600 dark:text-gray-400">Role</span>
                        <span className="font-medium capitalize">{currentUser?.role}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
                        <span className="text-gray-600 dark:text-gray-400">Account Created</span>
                        <span className="font-medium">
                            {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400">User ID</span>
                        <span className="font-medium">{currentUser?.user_id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}






