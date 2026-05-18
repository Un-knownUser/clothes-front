"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
// Добавили ChevronDown и ChevronUp для выпадающих списков
import { Trash2, Edit2, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import styles from './MyOutfits.module.css';
import Loader from "@/module/loader/Loader";
import Link from "next/link";
import ImageLightbox from "@/module/imageLightbox/ImageLightbox";

// Вынесли функцию наружу, чтобы использовать в разных частях компонента
const getCategory = (item) => item?.main_tag?.label || 'Другое';

export default function MyOutfits() {
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [outfits, setOutfits] = useState([]);
    const [wardrobe, setWardrobe] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [editingOutfit, setEditingOutfit] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", deg: 0, clothing: [] });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isWardrobeLoading, setIsWardrobeLoading] = useState(false);

    // Новое состояние для отслеживания открытых категорий
    const [expandedCategories, setExpandedCategories] = useState({});

    const token = Cookies.get('token');
    const headers = { Authorization: `Bearer ${token}` };
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        fetchOutfits();
    }, []);

    const fetchOutfits = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/outfits`,
                { headers }
            );
            setOutfits(data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            toast.error('Не удалось загрузить образы');
        } finally {
            setLoading(false);
        }
    };

    const fetchWardrobe = async () => {
        if (wardrobe.length > 0) return;
        setIsWardrobeLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/clothes`, { headers });
            setWardrobe(data.data || data || []);
        } catch (error) {
            toast.error('Ошибка загрузки гардероба');
        } finally {
            setIsWardrobeLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/outfits/${id}`,
                { headers }
            );
            setOutfits(prev => prev.filter(o => o.id !== id));
            toast.success('Образ удален');
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Ошибка удаления:', error);
            toast.error('Не удалось удалить образ');
        }
    };

    const handleOpenEditModal = (outfit) => {
        setEditingOutfit(outfit);
        setEditForm({
            name: outfit.name || "",
            deg: outfit.deg || 0,
            clothing: outfit.clothing ? [...outfit.clothing] : []
        });

        // По умолчанию открываем те категории, вещи из которых УЖЕ есть в образе
        const initialExpanded = {};
        if (outfit.clothing) {
            outfit.clothing.forEach(item => {
                initialExpanded[getCategory(item)] = true;
            });
        }
        setExpandedCategories(initialExpanded);

        fetchWardrobe();
    };

    // Функция переключения видимости категории
    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const handleAddClothing = (item) => {
        setEditForm(prev => ({
            ...prev,
            clothing: [...prev.clothing, item]
        }));
    };

    const handleRemoveClothing = (id) => {
        setEditForm(prev => ({
            ...prev,
            clothing: prev.clothing.filter(c => c.id !== id)
        }));
    };

    const handleUpdateOutfit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const payload = {
                name: editForm.name,
                deg: editForm.deg,
                clothing_ids: editForm.clothing.map(c => c.id)
            };

            const { data } = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/outfits/${editingOutfit.id}`,
                payload,
                { headers }
            );

            setOutfits(prev => prev.map(o =>
                o.id === editingOutfit.id ? { ...o, ...payload, clothing: editForm.clothing } : o
            ));

            toast.success('Образ успешно обновлен');
            setEditingOutfit(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Не удалось обновить образ');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Сегодня';
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн. назад`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    if (loading) return <Loader height={100} size={80} position="absolute" />;

    // Получаем список всех уникальных категорий из ВСЕГО гардероба
    const allCategories = Array.from(new Set(wardrobe.map(getCategory)));

    // Отфильтровываем вещи, которые уже добавлены в редактируемый образ
    const availableWardrobe = wardrobe.filter(wItem =>
        !editForm.clothing.find(cItem => cItem.id === wItem.id)
    );

    return (
        <>
            <div className="flex-column-sm">
                <div className={styles.header}>
                    <h2>Мои образы ({outfits.length})</h2>
                </div>

                {outfits.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>У вас пока нет образов</p>
                        <Link href="/outfits" className="btn btn-primary">Добавить</Link>
                    </div>
                ) : (
                    <div className={styles.outfitsLine}>
                        {outfits.map(outfit => (
                            <div key={outfit.id} className={styles.outfitCard}>
                                <div className={styles.outfitPreview}>
                                    {outfit.clothing && outfit.clothing.length > 0 ? (
                                        <ul className={styles.clothingLine}>
                                            {outfit.clothing.map(item => {
                                                const imgUrl = `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image_path}`;
                                                return (
                                                    <li key={item.id} className={styles.clothingItem}>
                                                        <img src={imgUrl} alt={item.name || 'Одежда'} style={{cursor: 'pointer'}} onClick={() => setFullScreenImage(imgUrl)} />
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className={styles.emptyPreview}><p>Нет вещей</p></div>
                                    )}
                                </div>

                                <div className={styles.outfitInfo}>
                                    <h4>
                                        {outfit.name}
                                        {outfit.deg !== undefined && <span className={styles.degBadge}> {outfit.deg}°C</span>}
                                        {outfit.is_public ? " (Публичный)" : ""}
                                    </h4>
                                    <div className={styles.outfitMeta}>
                                        <span className={styles.count}>{outfit.clothing?.length || 0} вещей</span>
                                        <span className={styles.date}>{formatDate(outfit.created_at)}</span>
                                    </div>
                                </div>

                                <div className={styles.outfitActions}>
                                    <button className={styles.editBtn} onClick={() => handleOpenEditModal(outfit)} title="Редактировать"><Edit2 size={18} /></button>
                                    <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(outfit.id)} title="Удалить"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Модальное окно удаления */}
                {deleteConfirm && (
                    <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                        <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                            <h2>Удалить образ?</h2>
                            <p>Это действие нельзя отменить</p>
                            <div className={styles.confirmActions}>
                                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Отмена</button>
                                <button className="btn btn-primary" onClick={() => handleDelete(deleteConfirm)}>Удалить</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Модальное окно редактирования */}
                {editingOutfit && (
                    <div className="modal-overlay" onClick={() => setEditingOutfit(null)}>
                        <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3>Редактировать образ</h3>
                                <button onClick={() => setEditingOutfit(null)} className="none-btn"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleUpdateOutfit} className={styles.editForm}>
                                <div>
                                    <div className={styles.inputGroup}>
                                        <label>Название образа</label>
                                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Температура (°C)</label>
                                        <input type="number" value={editForm.deg} onChange={(e) => setEditForm({ ...editForm, deg: parseInt(e.target.value) || 0 })} required />
                                    </div>
                                </div>

                                {/* Редактирование одежды по категориям */}
                                <div className={styles.clothingEditor}>
                                    {isWardrobeLoading ? (
                                        <p>Загрузка гардероба...</p>
                                    ) : (
                                        allCategories.map(category => {
                                            const selectedCatItems = editForm.clothing.filter(item => getCategory(item) === category);
                                            const availableCatItems = availableWardrobe.filter(item => getCategory(item) === category);
                                            const isExpanded = expandedCategories[category];

                                            return (
                                                <div key={category} className={styles.categorySection}>
                                                    {/* Кликабельный заголовок-аккордеон */}
                                                    <div
                                                        className={styles.categoryHeader}
                                                        onClick={() => toggleCategory(category)}
                                                    >
                                                        <h4 className={styles.categoryTitle}>
                                                            {category}
                                                            {selectedCatItems.length > 0 && (
                                                                <span className={styles.categoryBadge}>{selectedCatItems.length}</span>
                                                            )}
                                                        </h4>
                                                        {isExpanded ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
                                                    </div>

                                                    {/* Контент категории, виден только если isExpanded === true */}
                                                    {isExpanded && (
                                                        <div className={styles.categoryContent}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                                                <span style={{ fontWeight: "600" }}>В образе:</span>
                                                                <div className={styles.selectedClothesList}>
                                                                    {selectedCatItems.length === 0 && <span style={{ color: "var(--black)" }}>Пусто</span>}
                                                                    {selectedCatItems.map(item => (
                                                                        <div key={`sel-${item.id}`} className={styles.clothingThumbCard}>
                                                                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image_path}`} alt="Одежда" />
                                                                            <button type="button" className={styles.removeIconBtn} onClick={() => handleRemoveClothing(item.id)}>
                                                                                <X size={14} color="var(--white)" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                                                <span style={{ fontWeight: "600" }}>Можно добавить:</span>
                                                                <div className={styles.availableClothesList}>
                                                                    {availableCatItems.length === 0 && <span style={{ color: "var(--black)" }}>Все вещи добавлены</span>}
                                                                    {availableCatItems.map(item => (
                                                                        <div key={`av-${item.id}`} className={styles.clothingThumbCard} onClick={() => handleAddClothing(item)}>
                                                                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image_path}`} alt="Одежда" />
                                                                            <div className={styles.addOverlay}>
                                                                                <Plus size={24} color="var(--white)" />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                                    {isUpdating ? "Сохранение..." : "Сохранить изменения"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <ImageLightbox isOpen={!!fullScreenImage} src={fullScreenImage} onClose={() => setFullScreenImage(null)} />
        </>
    );
}