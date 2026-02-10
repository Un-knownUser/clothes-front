"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { X, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import styles from './Outfits.module.css';
import Loader from "@/module/loader/Loader";

export default function CreateOutfit() {
    const [categories, setCategories] = useState({});
    const [selectedItems, setSelectedItems] = useState({});
    const [outfitName, setOutfitName] = useState('');
    const [outfitDescription, setOutfitDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeModalCategory, setActiveModalCategory] = useState(null);

    const token = Cookies.get('token');
    const headers = { Authorization: `Bearer ${token}` };
    const router = useRouter();

    const categoryLabels = {
        tops: 'Верх',
        bottoms: 'Низ',
        shoes: 'Обувь',
        accessories: 'Аксессуары'
    };

    useEffect(() => {
        fetchClothing();
    }, []);

    const fetchClothing = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits/clothing-categories`,
                { headers }
            );
            setCategories(data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            toast.error('Не удалось загрузить одежду');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (category) => {
        setActiveModalCategory(category);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setActiveModalCategory(null);
    };

    const toggleItem = (category, item) => {
        setSelectedItems(prev => {
            const current = prev[category] || [];
            const exists = current.find(i => i.id === item.id);

            if (exists) {
                return {
                    ...prev,
                    [category]: current.filter(i => i.id !== item.id)
                };
            } else {
                return {
                    ...prev,
                    [category]: [...current, item]
                };
            }
        });
    };

    const removeItem = (category, itemId) => {
        setSelectedItems(prev => ({
            ...prev,
            [category]: (prev[category] || []).filter(i => i.id !== itemId)
        }));
    };

    const isSelected = (category, itemId) => {
        return selectedItems[category]?.some(i => i.id === itemId) || false;
    };

    const handleSave = async () => {
        const allSelected = Object.values(selectedItems).flat();

        if (allSelected.length === 0) {
            toast.warning('Выберите хотя бы одну вещь');
            return;
        }

        if (!outfitName.trim()) {
            toast.warning('Введите название образа');
            return;
        }

        if (allSelected.length > 20) {
            toast.warning('Максимум 20 вещей в образе');
            return;
        }

        setSaving(true);

        try {
            const clothingIds = allSelected.map(item => item.id);

            await axios.post(
                `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits`,
                {
                    name: outfitName,
                    description: outfitDescription,
                    clothing_ids: clothingIds
                },
                { headers }
            );

            toast.success('Образ создан!');
            router.push('/my-outfits');
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            toast.error(error.response?.data?.message || 'Не удалось создать образ');
        } finally {
            setSaving(false);
        }
    };

    const totalSelected = Object.values(selectedItems).flat().length;

    if (loading) {
        return <Loader height={100} size={80} position="absolute" />;
    }

    return (
        <div className="flex-column-sm">
            <h2>Создать образ</h2>

            <input
                type="text"
                placeholder="Название образа"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                className={styles.input}
                maxLength={255}
            />

            {totalSelected > 0 && (
                <div className={styles.infoBox}>
                    <p>Выбрано вещей: <strong>{totalSelected}</strong> из 20</p>
                </div>
            )}

            <div className={styles.categories}>
                {Object.entries(categoryLabels).map(([categoryKey, categoryLabel]) => {
                    const categoryItems = selectedItems[categoryKey] || [];
                    const availableItems = categories[categoryKey] || [];

                    return (
                        <div key={categoryKey} className={styles.category}>
                            <div className={styles.categoryHeader}>
                                <h4>
                                    {categoryLabel}
                                    <span className={styles.optional}> (необязательно)</span>
                                </h4>
                                {categoryItems.length > 0 && (
                                    <span className={styles.count}>
                                        {categoryItems.length}
                                    </span>
                                )}
                            </div>

                            <div className={styles.categoryContent}>
                                {categoryItems.length > 0 && (
                                    <div className={styles.selectedItems}>
                                        {categoryItems.map(item => (
                                            <div key={item.id} className={styles.selectedItem}>
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image_path}`}
                                                    alt={item.name}
                                                />
                                                <button
                                                    className={styles.removeBtn}
                                                    onClick={() => removeItem(categoryKey, item.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    {availableItems.length > 0 && (
                                        <button
                                            className={`btn btn-secondary ${styles.addBtn}`}
                                            onClick={() => openModal(categoryKey)}
                                        >
                                            {categoryItems.length > 0 ? 'Добавить ещё' : 'Добавить'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.footer}>
                <div>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving || totalSelected === 0 || !outfitName.trim()}
                    >
                        {saving ? 'Сохранение...' : `Создать образ${totalSelected > 0 ? ` (${totalSelected})` : ''}`}
                    </button>
                </div>
            </div>

            {isModalOpen && activeModalCategory && (
                <div className={`modal-overlay ${styles.outfitsModal}`} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Выберите {categoryLabels[activeModalCategory]?.toLowerCase()}</h3>
                            <button onClick={closeModal} className="none-btn">
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {categories[activeModalCategory]?.length > 0 ? (
                                <div className={styles.modalGrid}>
                                    {categories[activeModalCategory].map(item => (
                                        <div
                                            key={item.id}
                                            className={`${styles.modalItem} ${
                                                isSelected(activeModalCategory, item.id) ? styles.selected : ''
                                            }`}
                                            onClick={() => toggleItem(activeModalCategory, item)}
                                        >
                                            <div className={styles.modalItemImage}>
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image_path}`}
                                                    alt={item.name}
                                                />
                                                {isSelected(activeModalCategory, item.id) && (
                                                    <div className={styles.checkmark}>
                                                        <Check size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.emptyModal}>Нет доступной одежды в этой категории</p>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className="btn btn-primary" onClick={closeModal}>
                                Готово ({selectedItems[activeModalCategory]?.length || 0} выбрано)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
