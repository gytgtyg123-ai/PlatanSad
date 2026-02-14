import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import { FileText, Edit2, Save, X, Plus, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const emptyHero = {
  title: '',
  subtitle: '',
  button_text: '',
  button_link: '',
  background_image: ''
};

const emptyFooterLink = {
  section: '',
  title: '',
  url: '',
  order: 0,
  is_active: true
};

const AdminCMS = () => {
  const [pages, setPages] = useState([]);
  const [heroSection, setHeroSection] = useState(emptyHero);
  const [footerLinks, setFooterLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [editingHero, setEditingHero] = useState(false);
  const [editingFooterId, setEditingFooterId] = useState(null);
  const [footerDraft, setFooterDraft] = useState(emptyFooterLink);
  const [previewPageKey, setPreviewPageKey] = useState(null);
  const [pageFilter, setPageFilter] = useState('');

  const API_URL = process.env.REACT_APP_BACKEND_URL || '';

  // Завантаження даних
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Завантажити сторінки
      const pagesRes = await fetch(`${API_URL}/api/cms/pages`);
      const pagesData = await pagesRes.json();
      setPages(pagesData);

      // Завантажити hero
      const heroRes = await fetch(`${API_URL}/api/cms/hero`);
      const heroData = await heroRes.json();
      setHeroSection({ ...emptyHero, ...heroData });

      // Завантажити footer links
      const footerRes = await fetch(`${API_URL}/api/cms/footer-links`);
      const footerData = await footerRes.json();
      setFooterLinks(footerData);

    } catch (error) {
      toast.error('Помилка завантаження даних');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Редагування сторінки
  const handleSavePage = async (pageKey) => {
    try {
      const response = await fetch(`${API_URL}/api/cms/pages/${pageKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPage)
      });

      if (response.ok) {
        toast.success('Сторінку оновлено!');
        setEditingPage(null);
        loadData();
      } else {
        toast.error('Помилка оновлення');
      }
    } catch (error) {
      toast.error('Помилка збереження');
      console.error(error);
    }
  };

  // Редагування Hero
  const handleSaveHero = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/hero`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroSection)
      });

      if (response.ok) {
        toast.success('Hero секцію оновлено!');
        setEditingHero(false);
        loadData();
      } else {
        toast.error('Помилка оновлення');
      }
    } catch (error) {
      toast.error('Помилка збереження');
      console.error(error);
    }
  };

  const handleSaveFooterLink = async (linkId) => {
    try {
      const updatePayload = {
        title: footerDraft.title,
        url: footerDraft.url,
        order: footerDraft.order,
        is_active: footerDraft.is_active
      };
      const response = await fetch(`${API_URL}/api/cms/footer-links/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (response.ok) {
        toast.success('Посилання у футері оновлено!');
        setEditingFooterId(null);
        setFooterDraft(emptyFooterLink);
        loadData();
      } else {
        toast.error('Помилка оновлення посилання');
      }
    } catch (error) {
      toast.error('Помилка збереження');
      console.error(error);
    }
  };

  const handleCreateFooterLink = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cms/footer-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footerDraft)
      });

      if (response.ok) {
        toast.success('Посилання у футері додано!');
        setFooterDraft(emptyFooterLink);
        loadData();
      } else {
        toast.error('Помилка створення посилання');
      }
    } catch (error) {
      toast.error('Помилка збереження');
      console.error(error);
    }
  };

  const handleDeleteFooterLink = async (linkId) => {
    try {
      const response = await fetch(`${API_URL}/api/cms/footer-links/${linkId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Посилання видалено');
        if (editingFooterId === linkId) {
          setEditingFooterId(null);
          setFooterDraft(emptyFooterLink);
        }
        loadData();
      } else {
        toast.error('Помилка видалення');
      }
    } catch (error) {
      toast.error('Помилка видалення');
      console.error(error);
    }
  };

  const groupedFooterLinks = useMemo(() => {
    return footerLinks.reduce((acc, link) => {
      const sectionKey = link.section || 'Без секції';
      if (!acc[sectionKey]) {
        acc[sectionKey] = [];
      }
      acc[sectionKey].push(link);
      return acc;
    }, {});
  }, [footerLinks]);

  const filteredPages = useMemo(() => {
    const normalizedFilter = pageFilter.trim().toLowerCase();
    if (!normalizedFilter) {
      return pages;
    }
    return pages.filter((page) => {
      return (
        page.title.toLowerCase().includes(normalizedFilter) ||
        page.page_key.toLowerCase().includes(normalizedFilter)
      );
    });
  }, [pageFilter, pages]);

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
            <h1 className="text-3xl font-bold text-gray-800">Управління контентом</h1>
            <p className="text-gray-600 mt-1">Редагуйте тексти на сайті</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Головна секція (Hero)</h2>
            {!editingHero ? (
              <button
                onClick={() => setEditingHero(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Edit2 className="w-4 h-4" />
                Редагувати
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveHero}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Save className="w-4 h-4" />
                  Зберегти
                </button>
                <button
                  onClick={() => {
                    setEditingHero(false);
                    loadData();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {editingHero ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                <input
                  type="text"
                  value={heroSection.title}
                  onChange={(e) => setHeroSection({ ...heroSection, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Підзаголовок</label>
                <input
                  type="text"
                  value={heroSection.subtitle || ''}
                  onChange={(e) => setHeroSection({ ...heroSection, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Текст кнопки</label>
                <input
                  type="text"
                  value={heroSection.button_text || ''}
                  onChange={(e) => setHeroSection({ ...heroSection, button_text: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Посилання кнопки</label>
                <input
                  type="text"
                  value={heroSection.button_link || ''}
                  onChange={(e) => setHeroSection({ ...heroSection, button_link: e.target.value })}
                  placeholder="/catalog"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Фонова картинка (URL)</label>
                <input
                  type="text"
                  value={heroSection.background_image || ''}
                  onChange={(e) => setHeroSection({ ...heroSection, background_image: e.target.value })}
                  placeholder="https://"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-700"><strong>Заголовок:</strong> {heroSection?.title}</p>
              <p className="text-gray-700"><strong>Підзаголовок:</strong> {heroSection?.subtitle}</p>
              <p className="text-gray-700"><strong>Кнопка:</strong> {heroSection?.button_text}</p>
              <p className="text-gray-700"><strong>Посилання:</strong> {heroSection?.button_link || '—'}</p>
              <p className="text-gray-700"><strong>Фонова картинка:</strong> {heroSection?.background_image || '—'}</p>
            </div>
          )}
        </div>

        {/* Pages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Сторінки сайту</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={pageFilter}
                onChange={(e) => setPageFilter(e.target.value)}
                placeholder="Пошук сторінки..."
                className="w-full lg:w-72 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-4">
            {filteredPages.map(page => (
              <div key={page.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-lg">{page.title}</h3>
                  </div>
                  {editingPage?.page_key !== page.page_key ? (
                    <button
                      onClick={() => setEditingPage(page)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Редагувати
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewPageKey(previewPageKey === page.page_key ? null : page.page_key)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
                      >
                        {previewPageKey === page.page_key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {previewPageKey === page.page_key ? 'Сховати превʼю' : 'Превʼю'}
                      </button>
                      <button
                        onClick={() => handleSavePage(page.page_key)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        <Save className="w-4 h-4" />
                        Зберегти
                      </button>
                      <button
                        onClick={() => setEditingPage(null)}
                        className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {editingPage?.page_key === page.page_key ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                      <input
                        type="text"
                        value={editingPage.title}
                        onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Контент (HTML)</label>
                      <textarea
                        value={editingPage.content}
                        onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                        rows={10}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Символів: {editingPage.content?.length || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                      <input
                        type="text"
                        value={editingPage.meta_description || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                      <input
                        type="text"
                        value={editingPage.meta_keywords || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, meta_keywords: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {previewPageKey === page.page_key && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-700">Превʼю контенту</p>
                          <a
                            href={`/${page.page_key}`}
                            className="flex items-center gap-1 text-blue-600 text-sm hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Переглянути на сайті
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <div
                          className="prose prose-sm max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: editingPage.content || '' }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p className="mb-2"><strong>Сторінка:</strong> /{page.page_key}</p>
                    <p><strong>Останнє оновлення:</strong> {new Date(page.updated_at).toLocaleString('uk-UA')}</p>
                  </div>
                )}
              </div>
            ))}
            {filteredPages.length === 0 && (
              <p className="text-gray-500 text-sm">Немає сторінок, що відповідають фільтру.</p>
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Footer посилання</h2>
          </div>

          <div className="border rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-3">Додати нове посилання</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <input
                type="text"
                value={footerDraft.section}
                onChange={(e) => setFooterDraft({ ...footerDraft, section: e.target.value })}
                placeholder="Секція (наприклад, Компанія)"
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={footerDraft.title}
                onChange={(e) => setFooterDraft({ ...footerDraft, title: e.target.value })}
                placeholder="Назва"
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={footerDraft.url}
                onChange={(e) => setFooterDraft({ ...footerDraft, url: e.target.value })}
                placeholder="/delivery"
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={footerDraft.order}
                onChange={(e) => setFooterDraft({ ...footerDraft, order: Number(e.target.value) })}
                placeholder="Порядок"
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={footerDraft.is_active}
                  onChange={(e) => setFooterDraft({ ...footerDraft, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-500"
                />
                Активне посилання
              </label>
              <button
                onClick={handleCreateFooterLink}
                disabled={!footerDraft.section || !footerDraft.title || !footerDraft.url}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Додати
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedFooterLinks).map(([section, links]) => (
              <div key={section} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">{section}</h3>
                <div className="space-y-3">
                  {links.map((link) => (
                    <div key={link.id} className="flex flex-col gap-3 border rounded-lg p-3">
                      {editingFooterId === link.id ? (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          <div className="text-sm text-gray-600">
                            <p className="font-semibold">Секція</p>
                            <p>{link.section}</p>
                          </div>
                          <input
                            type="text"
                            value={footerDraft.title}
                            onChange={(e) => setFooterDraft({ ...footerDraft, title: e.target.value })}
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={footerDraft.url}
                            onChange={(e) => setFooterDraft({ ...footerDraft, url: e.target.value })}
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            value={footerDraft.order}
                            onChange={(e) => setFooterDraft({ ...footerDraft, order: Number(e.target.value) })}
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={footerDraft.is_active}
                              onChange={(e) => setFooterDraft({ ...footerDraft, is_active: e.target.checked })}
                              className="h-4 w-4 text-blue-500"
                            />
                            Активне
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveFooterLink(link.id)}
                              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                            >
                              <Save className="w-4 h-4" />
                              Зберегти
                            </button>
                            <button
                              onClick={() => {
                                setEditingFooterId(null);
                                setFooterDraft(emptyFooterLink);
                              }}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                            >
                              Скасувати
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div className="text-sm text-gray-700 space-y-1">
                            <p><strong>Назва:</strong> {link.title}</p>
                            <p><strong>URL:</strong> {link.url}</p>
                            <p><strong>Порядок:</strong> {link.order}</p>
                            <p><strong>Статус:</strong> {link.is_active ? 'Активне' : 'Неактивне'}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingFooterId(link.id);
                                setFooterDraft({
                                  section: link.section,
                                  title: link.title,
                                  url: link.url,
                                  order: link.order,
                                  is_active: link.is_active
                                });
                              }}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                            >
                              <Edit2 className="w-4 h-4" />
                              Редагувати
                            </button>
                            <button
                              onClick={() => handleDeleteFooterLink(link.id)}
                              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Видалити
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {footerLinks.length === 0 && (
              <p className="text-gray-500 text-sm">Немає посилань у футері.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCMS;
