import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface PostCreatorProps {
  onPostCreated?: () => void;
}

export const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }

    setSelectedFiles(files);
    
    // Create previews for selected files
    const newPreviews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return file.type.startsWith('video/') ? '/video-placeholder.png' : '/file-placeholder.png';
    });
    
    setPreviews(newPreviews);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content);
      selectedFiles.forEach(file => formData.append('media', file));

      const response = await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`
        }
      });

      setContent('');
      setSelectedFiles([]);
      setPreviews([]);
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,video/*,audio/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={openFilePicker}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Add Media
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!content && !selectedFiles.length)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
              isLoading || (!content && !selectedFiles.length)
                ? 'bg-blue-300'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </form>
    </div>
  );
}; 