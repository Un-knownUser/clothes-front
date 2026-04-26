"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import { Check, XCircle } from 'lucide-react';
import styles from './../Admin.module.css';

export default function UsersAdminPage() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('desc');
    const [page, setPage] = useState(1);

    // Состояния для редактирования роли
    const [editingId, setEditingId] = useState(null);
    const [editRole, setEditRole] = useState('');

    const token = Cookies.get('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/admin/users`, {
                headers,
                params: { page, search, role: roleFilter, sort_by: sortBy, sort_dir: sortDir }
            });
            setUsers(data?.data || []);
            setPagination({
                current_page: data?.current_page || 1,
                last_page: data?.last_page || 1
            });
        } catch (error) {
            toast.error('Ошибка загрузки пользователей');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter, sortBy, sortDir]);

    const debouncedSearch = useDebouncedCallback(() => {
        setPage(1);
        fetchUsers();
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

    const startEditing = (user) => {
        setEditingId(user.id);
        setEditRole(user.role || 'user');
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const handleEditSave = async (id) => {
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/admin/users/${id}`,
                { role: editRole },
                { headers }
            );
            toast.success('Роль пользователя обновлена');
            setEditingId(null);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления роли');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <input
                    type="text"
                    placeholder="Поиск по имени или email..."
                    value={search}
                    onChange={handleSearchChange}
                    className={styles.input}
                />
                <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    className={styles.select}
                >
                    <option value="">Все роли</option>
                    <option value="admin">Администраторы</option>
                    <option value="user">Пользователи</option>
                </select>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('id')}>ID {sortBy === 'id' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('name')}>Имя {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('email')}>Email {sortBy === 'email' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('role')}>Роль {sortBy === 'role' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                        <th onClick={() => handleSort('created_at')}>Дата регистрации {sortBy === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan="6" className={styles.center}>Загрузка данных...</td></tr>
                    ) : users.length === 0 ? (
                        <tr><td colSpan="6" className={styles.center}>Пользователи не найдены</td></tr>
                    ) : (
                        users.map(user => (
                            <tr key={user.id} className={editingId === user.id ? styles.editingRow : ''}>
                                <td>{user.id}</td>
                                <td><strong>{user.name}</strong></td>
                                <td>{user.email}</td>

                                <td>
                                    {editingId === user.id ? (
                                        <select
                                            className={styles.editSelect}
                                            value={editRole}
                                            onChange={(e) => setEditRole(e.target.value)}
                                        >
                                            <option value="user">user</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    ) : (
                                        <span className={styles.badge}>
                                            {user.role || 'user'}
                                        </span>
                                    )}
                                </td>

                                <td>{new Date(user.created_at).toLocaleDateString('ru-RU')}</td>

                                <td className={styles.actionCells}>
                                    {editingId === user.id ? (
                                        <>
                                            <button onClick={() => handleEditSave(user.id)} className={styles.btnSave} title="Сохранить"><Check size={18}/></button>
                                            <button onClick={cancelEditing} className={styles.btnCancelEdit} title="Отменить"><XCircle size={18}/></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEditing(user)} className={styles.btnEdit}>Роль</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {pagination.last_page > 1 && (
                <div className={styles.pagination}>
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>Назад</button>
                    <span>Стр. {pagination.current_page} из {pagination.last_page}</span>
                    <button disabled={page === pagination.last_page} onClick={() => setPage(page + 1)}>Вперед</button>
                </div>
            )}
        </div>
    );
}