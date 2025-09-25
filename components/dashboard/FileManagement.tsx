import { useState } from 'react';
import { Modal, Button, Card } from '../ui';

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

interface FileManagementProps {
  files: FileItem[];
  onFileUpload: (files: FileList) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
  onDeleteFiles: (ids: string[]) => Promise<void>;
}

export default function FileManagement({ 
  files, 
  onFileUpload, 
  onDeleteFile,
  onDeleteFiles 
}: FileManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentFolder] = useState('root');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      await onFileUpload(files);
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      await onDeleteFiles(selectedFiles);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return (
        <svg className="w-12 h-12 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
        </svg>
      );
    }

    switch (file.icon) {
      case 'document':
        return (
          <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        );
      case 'spreadsheet':
        return (
          <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        );
      case 'image':
        return (
          <svg className="w-12 h-12 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        );
    }
  };

  const filteredFiles = files.filter(file => file.folder === currentFolder);

  return (
    <Card title="File Management">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-4">
          <label className="cursor-pointer">
            <Button disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
          
          {selectedFiles.length > 0 && (
            <Button variant="danger" onClick={handleDeleteSelected}>
              Delete Selected ({selectedFiles.length})
            </Button>
          )}
        </div>
        
        <Button variant="secondary" size="sm" onClick={() => setShowModal(true)}>
          View All Files
        </Button>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file._id}
            onClick={() => handleFileSelect(file._id)}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedFiles.includes(file._id)
                ? 'border-amber-500 bg-amber-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-2 right-2">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                selectedFiles.includes(file._id)
                  ? 'bg-amber-500 border-amber-500'
                  : 'border-slate-300'
              }`}>
                {selectedFiles.includes(file._id) && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </div>

            {/* File Icon */}
            <div className="flex justify-center mb-3">
              {getFileIcon(file)}
            </div>

            {/* File Info */}
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900 truncate mb-1">{file.name}</p>
              <p className="text-xs text-slate-500">{file.size}</p>
              <p className="text-xs text-slate-400 mt-1">{file.dateModified || file.uploadDate}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
          </svg>
          <p className="text-slate-600 font-medium">No files in this folder</p>
          <p className="text-slate-500 text-sm mt-1">Upload files to get started</p>
        </div>
      )}

      {/* Full File Manager Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="File Manager"
        maxWidth="max-w-6xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file._id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-800">{file.name}</h5>
                    <p className="text-sm text-slate-600">{file.size} • {file.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{file.uploadDate || file.dateModified}</span>
                  <button
                    onClick={() => onDeleteFile(file._id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </Card>
  );
}