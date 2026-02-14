import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { FileText, Edit2, Save, X, Plus, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    is_published: true
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/blog/posts?published_only=false`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      toast.error('Помилка завантаження статей');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      const response = await fetch(`${API_URL}/api/blog/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });

      if (response.ok) {
        toast.success('Статтю створено!');
        setCreating(false);
        setNewPost({
          title: '',
          excerpt: '',
          content: '',
          category: '',
          tags: [],
          is_published: true
        });
        loadPosts();
      } else {
        toast.error('Помилка створення');
      }
    } catch (error) {
      toast.error('Помилка збереження');
      console.error(error);
    }
  };

  const handleUpdatePost = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/api/blog/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPost)
      });

      if (response.ok) {
        toast.success('Статтю оновлено!');
        setEditingPost(null);
        loadPosts();
      } else {
        toast.error('Помилка оновлення');
      }
    } catch (error) {
      toast.error('Помилка збереження');
      console.error(error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Видалити цю статтю?')) return;

    try {
      const response = await fetch(`${API_URL}/api/blog/posts/${postId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Статтю видалено');
        loadPosts();
      } else {
        toast.error('Помилка видалення');
      }
    } catch (error) {
      toast.error('Помилка видалення');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Управління блогом</h1>
            <p className="text-gray-600 mt-1">Створюйте та редагуйте статті</p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
            Нова стаття
          </button>
        </div>

        {/* Create New Post */}
        {creating && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Створити нову статтю</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Заголовок</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Введіть заголовок статті"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Короткий опис</label>
                <input
                  type="text"
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Короткий опис для превью"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Категорія</label>
                <input
                  type="text"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Наприклад: Догляд, Посадка"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Контент (HTML)</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={12}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                  placeholder="<h2>Заголовок</h2>&#10;<p>Текст статті...</p>"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPost.is_published}
                  onChange={(e) => setNewPost({ ...newPost, is_published: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm">Опублікувати одразу</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreatePost}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Створити статтю
                </button>
                <button
                  onClick={() => setCreating(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Статті ({posts.length})</h2>
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{post.title}</h3>
                      {!post.is_published && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                          Чернетка
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{post.excerpt}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>📂 {post.category}</span>
                      <span>👁 {post.views} переглядів</span>
                      <span>📅 {new Date(post.published_at).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>
                  {editingPost?.id !== post.id ? (
                    <div className="flex gap-2">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setEditingPost(post)}
                        className="p-2 text-green-500 hover:bg-green-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdatePost(post.id)}
                        className="px-3 py-1.5 bg-green-500 text-white rounded text-sm"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingPost(null)}
                        className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded text-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {editingPost?.id === post.id && (
                  <div className="space-y-3 mt-4 pt-4 border-t">
                    <input
                      type="text"
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      value={editingPost.excerpt || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Короткий опис"
                    />
                    <input
                      type="text"
                      value={editingPost.category || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Категорія"
                    />
                    <textarea
                      value={editingPost.content}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                      rows={10}
                      className="w-full px-3 py-2 border rounded font-mono text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingPost.is_published}
                        onChange={(e) => setEditingPost({ ...editingPost, is_published: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label className="text-sm">Опубліковано</label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBlog;
