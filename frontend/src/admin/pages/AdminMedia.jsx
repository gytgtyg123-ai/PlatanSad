import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Image, Upload, Trash2, Edit2, Save, X, 
  FolderOpen, Search, Grid, List, Copy, Check,
  FileImage, FileVideo, FileText, HardDrive
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminMedia = () => {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(null);
  
  const fileInputRef = useRef(null);
  const { token } = useAdminAuth();
  const API_URL = process.env.REACT_APP_BACKEND_URL || '';

  // Load media files
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/media/files?limit=200`;
      
      if (filterType !== 'all') {
        url += `&file_type=${filterType}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      toast.error('Помилка завантаження файлів');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, filterType]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/media/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    loadFiles();
    loadStats();
  }, [loadFiles, loadStats]);

  // Handle file upload
  const handleUpload = async (event) => {
    const uploadFiles = event.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of uploadFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'general');
      formData.append('title', file.name);

      try {
        const response = await fetch(`${API_URL}/api/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          successCount++;
        } else {
          const error = await response.json();
          console.error('Upload error:', error);
          errorCount++;
        }
      } catch (error) {
        console.error('Upload error:', error);
        errorCount++;
      }
    }

    setUploading(false);
    
    if (successCount > 0) {
      toast.success(`Завантажено ${successCount} файл(ів)`);
      loadFiles();
      loadStats();
    }
    if (errorCount > 0) {
      toast.error(`Помилка при завантаженні ${errorCount} файл(ів)`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file delete
  const handleDelete = async (fileId) => {
    if (!window.confirm('Видалити цей файл?')) return;

    try {
      const response = await fetch(`${API_URL}/api/media/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Файл видалено');
        loadFiles();
        loadStats();
      } else {
        toast.error('Помилка видалення');
      }
    } catch (error) {
      toast.error('Помилка видалення');
      console.error(error);
    }
  };

  // Handle file update
  const handleUpdate = async (fileId) => {
    try {
      const response = await fetch(`${API_URL}/api/media/files/${fileId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alt_text: editingFile.alt_text,
          title: editingFile.title
        })
      });

      if (response.ok) {
        toast.success('Файл оновлено');
        setEditingFile(null);
        loadFiles();
      } else {
        toast.error('Помилка оновлення');
      }
    } catch (error) {
      toast.error('Помилка оновлення');
      console.error(error);
    }
  };

  // Copy URL to clipboard
  const copyUrl = async (url) => {
    const fullUrl = `${API_URL}${url}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(url);
      toast.success('URL скопійовано');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error('Помилка копіювання');
    }
  };

  // Filter files by search
  const filteredFiles = files.filter(file => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      file.original_name?.toLowerCase().includes(query) ||
      file.title?.toLowerCase().includes(query) ||
      file.alt_text?.toLowerCase().includes(query)
    );
  });

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Get icon for file type
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return <FileImage className="w-5 h-5" />;
      case 'video': return <FileVideo className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  if (loading && files.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Медіа-бібліотека</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Управління зображеннями та файлами</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Завантаження...' : 'Завантажити файли'}
            </label>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Всього файлів</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.total_files}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FileImage className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Зображення</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.by_type?.images || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FileVideo className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Відео</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.by_type?.videos || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <HardDrive className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Розмір</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.total_size_formatted}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Пошук файлів..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>

            {/* Type filter */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Всі' },
                { key: 'image', label: 'Зображення' },
                { key: 'video', label: 'Відео' },
                { key: 'document', label: 'Документи' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === filter.key
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* View mode toggle */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Files Grid/List */}
        {filteredFiles.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Немає файлів</h3>
            <p className="text-gray-500 dark:text-gray-500 mt-1">
              {searchQuery ? 'Спробуйте змінити пошуковий запит' : 'Завантажте перші файли'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden group"
              >
                {/* Preview */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
                  {file.file_type === 'image' ? (
                    <img
                      src={`${API_URL}${file.url}`}
                      alt={file.alt_text || file.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(file.file_type)}
                    </div>
                  )}
                  
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => copyUrl(file.url)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="Копіювати URL"
                    >
                      {copiedUrl === file.url ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-700" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingFile(file)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="Редагувати"
                    >
                      <Edit2 className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 bg-white rounded-full hover:bg-red-100"
                      title="Видалити"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-800 dark:text-white truncate" title={file.original_name}>
                    {file.original_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatSize(file.file_size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Файл</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Тип</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Розмір</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Дата</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                          {file.file_type === 'image' ? (
                            <img
                              src={`${API_URL}${file.url}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getFileIcon(file.file_type)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{file.original_name}</p>
                          {file.title && file.title !== file.original_name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{file.title}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{file.file_type}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{formatSize(file.file_size)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {file.created_at ? new Date(file.created_at).toLocaleDateString('uk-UA') : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyUrl(file.url)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          title="Копіювати URL"
                        >
                          {copiedUrl === file.url ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingFile(file)}
                          className="p-1.5 text-gray-500 hover:text-blue-500"
                          title="Редагувати"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-1.5 text-gray-500 hover:text-red-500"
                          title="Видалити"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editingFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Редагувати файл</h3>
                  <button
                    onClick={() => setEditingFile(null)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview */}
                {editingFile.file_type === 'image' && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={`${API_URL}${editingFile.url}`}
                      alt=""
                      className="w-full max-h-48 object-contain"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Назва
                    </label>
                    <input
                      type="text"
                      value={editingFile.title || ''}
                      onChange={(e) => setEditingFile({ ...editingFile, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alt текст (для SEO)
                    </label>
                    <input
                      type="text"
                      value={editingFile.alt_text || ''}
                      onChange={(e) => setEditingFile({ ...editingFile, alt_text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      placeholder="Опис зображення для пошукових систем"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URL файлу
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${API_URL}${editingFile.url}`}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm"
                      />
                      <button
                        onClick={() => copyUrl(editingFile.url)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p><strong>Оригінальна назва:</strong> {editingFile.original_name}</p>
                    <p><strong>Розмір:</strong> {formatSize(editingFile.file_size)}</p>
                    <p><strong>Тип:</strong> {editingFile.mime_type}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleUpdate(editingFile.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Save className="w-4 h-4" />
                    Зберегти
                  </button>
                  <button
                    onClick={() => setEditingFile(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;
