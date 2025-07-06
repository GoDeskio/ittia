import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface UploadSettingsData {
  maxFileSize: number;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export const UploadSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UploadSettingsData | null>(null);
  const [newMaxSize, setNewMaxSize] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/admin/upload-settings');
      setSettings(response.data);
      setNewMaxSize(response.data.maxFileSize);
    } catch (error) {
      setError('Failed to fetch upload settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/api/admin/upload-settings', {
        maxFileSize: newMaxSize
      });
      setSettings(response.data);
      setSuccess('Upload settings updated successfully');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update settings');
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Settings</h2>
      
      {/* Current Settings */}
      {settings && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Maximum File Size:</p>
              <p className="font-medium">{formatBytes(settings.maxFileSize)}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Modified:</p>
              <p className="font-medium">{new Date(settings.lastModifiedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Update Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Maximum File Size (bytes)
          </label>
          <div className="flex gap-4">
            <input
              type="number"
              value={newMaxSize}
              onChange={(e) => setNewMaxSize(Number(e.target.value))}
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            <div className="flex-1 p-2 bg-gray-100 rounded-lg">
              {formatBytes(newMaxSize)}
            </div>
          </div>
          {user?.role === 'admin' && (
            <p className="text-sm text-gray-500 mt-1">
              Admin limit: 25GB. Contact a god mode user for higher limits.
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Update Settings
        </button>
      </form>

      {/* Quick Set Buttons */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Quick Set</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1, 5, 10, 25].map(size => (
            <button
              key={size}
              onClick={() => setNewMaxSize(size * 1024 * 1024 * 1024)} // Convert GB to bytes
              className="p-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {size}GB
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 