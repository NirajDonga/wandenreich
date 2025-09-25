import { useState, useEffect } from 'react';

interface FileItem {
  _id: string;
  name: string;
  size: string;
  type: string;
  folder: string;
  dateModified?: string;
  uploadDate?: string;
  icon?: string;
}

export function useFiles() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFiles = async (fileList: FileList) => {
    try {
      const formData = new FormData();
      Array.from(fileList).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const uploadedFiles = await response.json();
        setFiles(prev => [...prev, ...uploadedFiles]);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId })
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => file._id !== fileId));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const deleteFiles = async (fileIds: string[]) => {
    try {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: fileIds })
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => !fileIds.includes(file._id)));
      }
    } catch (error) {
      console.error('Error deleting files:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    files,
    isLoading,
    uploadFiles,
    deleteFile,
    deleteFiles,
    refetch: fetchFiles
  };
}