import { API_ENDPOINTS } from '../utils/constants';

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

class FileService {
  async getFiles(): Promise<FileItem[]> {
    const response = await fetch(API_ENDPOINTS.FILES);
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }
    return response.json();
  }

  async uploadFiles(files: FileList): Promise<FileItem[]> {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(API_ENDPOINTS.FILES, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload files');
    }
    return response.json();
  }

  async deleteFile(fileId: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.FILES, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: fileId })
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  }

  async deleteFiles(fileIds: string[]): Promise<void> {
    const response = await fetch(API_ENDPOINTS.FILES, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: fileIds })
    });

    if (!response.ok) {
      throw new Error('Failed to delete files');
    }
  }

  async createFolder(name: string, parentFolder: string = 'root'): Promise<FileItem> {
    const response = await fetch(`${API_ENDPOINTS.FILES}/folder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parentFolder })
    });

    if (!response.ok) {
      throw new Error('Failed to create folder');
    }
    return response.json();
  }
}

export const fileService = new FileService();