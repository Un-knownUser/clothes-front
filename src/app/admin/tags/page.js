"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import { X, Check, XCircle } from 'lucide-react';
import styles from './../Admin.module.css';

export default function TagsAdminPage() {
    const [tags, setTags] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

    // Фильтры
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');
    const [page, setPage] = useState(1);

    // Состояния для создания
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTag, setNewTag] = useState({ label: '', key: '', group: 'main' });

    // Состояния для редактирования
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ label: '', key: '', group: '' });

    const token = Cookies.get('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchTags = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/admin/tags`, {
                headers,
                params: { page, search, group: groupFilter, sort_by: sortBy, sort_dir: sortDir }
            });
            setTags(data?.data || []);
            setPagination({
                current_page: data?.current_page || 1,
                last_page: data?.last_page || 1
            });
        } catch (error) {
            toast.error('Ошибка загрузки тегов');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, [page, groupFilter, sortBy, sortDir]);

    const debouncedSearch = useDebouncedCallback(() => {
        setPage(1);
        fetchTags();
    }, 500);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedSearch();
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDir('asc');
        }
        setPage(1);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/admin/tags`, newTag, { headers });
            toast.success('Тег успешно создан');
            setIsModalOpen(false);
            setNewTag({ label: '', key: '', group: 'main' }); // Сброс формы
            fetchTags(); // Обновляем список
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания тега');
        }
    };

    const startEditing = (tag) => {
        setEditingId(tag.id);
        setEditForm({ label: tag.label, key: tag.key, group: tag.group });
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const handleEditSave = async (id) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/admin/tags/${id}`, editForm, { headers });
            toast.success('Тег обновлен');
            setEditingId(null);
            fetchTags();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления тега');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Вы уверены, что хотите удалить этот тег? Это может повлиять на привязанные вещи.')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/admin/tags/${id}`, { headers });
            toast.success('Тег удален');
            fetchTags();
        } catch (error) {
            toast.error('Ошибка удаления');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <input
                    type="text"
                    placeholder="Поиск по названию или ключу..."
                    value={search}
                    onChange={handleSearchChange}
                    className={styles.input}
                />
                <select
                    value={groupFilter}
                    onChange={(e) => { setGroupFilter(e.target.value); setPage(1); }}
                    className={styles.select}
                >
                    <option value="">Все группы</option>
                    <option value="main">Тип одежды (main)</option>
                    <option value="color">Цвет (color)</option>
                    <option value="season">Сезон (season)</option>
                    <option value="style">Стиль (style)</option>
                    <option value="occasion">Повод (occasion)</option>
                </select>
                <button className={styles.btnAdd} onClick={() => setIsModalOpen(true)}>
                    Добавить
                </button>
            </div>

            {/* ТАБЛИЦА */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('label')}>Название {sortBy === 'label' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('key')}>Ключ {sortBy === 'key' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('group')}>Группа {sortBy === 'group' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className={styles.center}>Загрузка данных...</td></tr>
                    ) : tags.length === 0 ? (
                        <tr><td colSpan="5" className={styles.center}>Ничего не найдено</td></tr>
                    ) : (
                        tags.map(tag => (
                            <tr key={tag.id} className={editingId === tag.id ? styles.editingRow : ''}>
                                <td>{tag.id}</td>

                                {/* Если ID совпадает, показываем инпуты, иначе - текст */}
                                {editingId === tag.id ? (
                                    <>
                                        <td>
                                            <input
                                                className={styles.editInput}
                                                value={editForm.label}
                                                onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className={styles.editInput}
                                                value={editForm.key}
                                                onChange={(e) => setEditForm({...editForm, key: e.target.value})}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className={styles.editSelect}
                                                value={editForm.group}
                                                onChange={(e) => setEditForm({...editForm, group: e.target.value})}
                                            >
                                                <option value="main">main</option>
                                                <option value="color">color</option>
                                                <option value="season">season</option>
                                                <option value="style">style</option>
                                                <option value="occasion">occasion</option>
                                            </select>
                                        </td>
                                        <td className={styles.actionCells}>
                                            <button onClick={() => handleEditSave(tag.id)} className={styles.btnSave} title="Сохранить"><Check size={18}/></button>
                                            <button onClick={cancelEditing} className={styles.btnCancelEdit} title="Отменить"><XCircle size={18}/></button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td><strong>{tag.label}</strong></td>
                                        <td><code>{tag.key}</code></td>
                                        <td><span className={styles.badge}>{tag.group}</span></td>
                                        <td className={styles.actionCells}>
                                            <button onClick={() => startEditing(tag)} className={styles.btnEdit}>Редактировать</button>
                                            <button onClick={() => handleDelete(tag.id)} className={styles.btnDelete}>Удалить</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {pagination.last_page > 1 && (
                <div className={styles.pagination}>
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className=" btn btn-primary">Назад</button>
                    <span>Стр. {pagination.current_page} из {pagination.last_page}</span>
                    <button disabled={page === pagination.last_page} onClick={() => setPage(page + 1)} className=" btn btn-primary">Вперед</button>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Добавить новый тег</h3>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Название (на русском)</label>
                                <input
                                    type="text"
                                    required
                                    value={newTag.label}
                                    onChange={(e) => setNewTag({...newTag, label: e.target.value})}
                                    placeholder="Например: Футболка"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Уникальный ключ (англ)</label>
                                <input
                                    type="text"
                                    required
                                    value={newTag.key}
                                    onChange={(e) => setNewTag({...newTag, key: e.target.value.toLowerCase()})}
                                    placeholder="Например: t_shirt"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Группа</label>
                                <select
                                    required
                                    value={newTag.group}
                                    onChange={(e) => setNewTag({...newTag, group: e.target.value})}
                                >
                                    <option value="main">Тип (main)</option>
                                    <option value="color">Цвет (color)</option>
                                    <option value="season">Сезон (season)</option>
                                    <option value="style">Стиль (style)</option>
                                    <option value="occasion">Повод (occasion)</option>
                                </select>
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Отмена</button>
                                <button type="submit" className="btn btn-primary">Создать</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}