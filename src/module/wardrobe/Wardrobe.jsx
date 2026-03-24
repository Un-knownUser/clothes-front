"use client"

import styles from "./Wardrobe.module.css";
import {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {useRouter} from "next/navigation";
import axios from "axios";
import { Filter, X, MoveUp, MoveDown, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Loader from "@/module/loader/Loader";
import {toast} from "sonner";

export default function Wardrobe() {
    const [clothes, setClothes] = useState([]);
    const [filteredClothes, setFilteredClothes] = useState([]);
    const [allTags, setAllTags] = useState({});
    const [loading, setLoading] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [usedInOutfits, setUsedInOutfits] = useState([]);

    const [filters, setFilters] = useState({
        main: [],
        color: [],
        season: [],
        style: [],
        occasion: []
    });

    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const token  = Cookies.get("token");
    const headers = { Authorization: `Bearer ${token}` };
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            setLoading(false);
            router.push("/login");
        }
    }, [token, router])

    const fetchData = async () => {
        try {
            const [tagsResponse, clothesResponse] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/tags`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/clothes`, { headers })
            ]);

            const groupedTags = tagsResponse.data.reduce((acc, tag) => {
                if (!acc[tag.group]) {
                    acc[tag.group] = [];
                }
                acc[tag.group].push(tag);
                return acc;
            }, {});

            setAllTags(groupedTags);
            setClothes(clothesResponse.data);
            setFilteredClothes(clothesResponse.data);
        } catch (error) {
            console.error("Ошибка загрузки:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [])

    useEffect(() => {
        let result = [...clothes];

        if (filters.main.length > 0) {
            result = result.filter(item =>
                filters.main.includes(item.main_tag_id)
            );
        }

        ['color', 'season', 'style', 'occasion'].forEach(group => {
            if (filters[group].length > 0) {
                result = result.filter(item =>
                    item.tags?.some(tag =>
                        tag.group === group && filters[group].includes(tag.id)
                    )
                );
            }
        });

        result.sort((a, b) => {
            let comparison = 0;

            if (sortBy === 'created_at') {
                comparison = new Date(a.created_at) - new Date(b.created_at);
            } else if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name, 'ru');
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredClothes(result);
    }, [clothes, filters, sortBy, sortOrder]);

    const checkClothingUsage = async (clothingId) => {
        try {
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/clothes/${clothingId}/outfits`,
                { headers }
            );
            return data;
        } catch (error) {
            console.error("Ошибка проверки использования:", error);
            return [];
        }
    };

    const handleDeleteClick = async (item) => {
        setItemToDelete(item);
        const outfits = await checkClothingUsage(item.id);
        setUsedInOutfits(outfits);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        setDeleteLoading(true);
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/clothes/${itemToDelete.id}`,
                { headers }
            );
            toast.success('Одежда удалена');
            fetchData();
            setDeleteModalOpen(false);
        } catch (error) {
            console.error("Ошибка удаления:", error);
            toast.error('Ошибка при удалении');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleFilterChange = (group, tagId) => {
        setFilters(prev => {
            const currentGroup = prev[group];
            const newGroup = currentGroup.includes(tagId)
                ? currentGroup.filter(id => id !== tagId)
                : [...currentGroup, tagId];

            return { ...prev, [group]: newGroup };
        });
    };

    const resetFilters = () => {
        setFilters({
            main: [],
            color: [],
            season: [],
            style: [],
            occasion: []
        });
    };

    const activeFiltersCount = Object.values(filters).flat().length;

    if (loading) {
        return <Loader height={100} size={80} position="absolute" />;
    }

    return (
        <div className="flex-column-sm">
            <div className={styles.header}>
                <h2>Мой гардероб ({filteredClothes.length}{clothes.length !== filteredClothes.length && ` из ${clothes.length}`})</h2>

                <div className={styles.topControls}>
                    <button
                        className={styles.filterBtn}
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        <Filter className={styles.svg} />
                        {activeFiltersCount > 0 && (
                            <span className={styles.filterBadge}>{activeFiltersCount}</span>
                        )}
                    </button>

                    <div className={styles.sortPanel}>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={styles.sortSelect}
                        >
                            <option value="created_at">По дате</option>
                            <option value="name">По названию</option>
                        </select>

                        <button
                            className={styles.sortOrderBtn}
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
                        >
                            {sortOrder === 'asc' ? <MoveUp className={styles.svg} /> : <MoveDown className={styles.svg} />}
                        </button>
                    </div>
                </div>
            </div>

            {deleteModalOpen && (
                <div className={`modal-overlay ${styles.wardrobeModal}`} onClick={() => setDeleteModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Удалить одежду?</h3>
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="none-btn"
                                disabled={deleteLoading}
                            >
                                <X />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <img
                                className={styles.deleteImage}
                                src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${itemToDelete.image_path}`}
                                alt={itemToDelete?.name}
                            />

                            {usedInOutfits.length > 0 ? (
                                <>
                                    <div className={styles.warningText}>
                                        <p>Эта одежда используется в <strong>{usedInOutfits.length}</strong> образе(ах)</p>
                                        <p>Образы станут неполными после удаления одного из элементов.</p>
                                    </div>
                                    <ul className={styles.outfitsList}>
                                        {usedInOutfits.map((outfit) => (
                                            <li key={outfit.id} className={styles.outfitItem}>
                                                <p>{outfit.name}</p>
                                                <div className={styles.outfitClothes}>
                                                    {outfit.clothing.map((clothingItem) => (
                                                        <div
                                                            key={clothingItem.id}
                                                            className={`${styles.outfitClothesDiv} ${clothingItem.id === itemToDelete?.id && styles.deletingCloth}`}
                                                        >
                                                            <img
                                                                src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${clothingItem.image_path}`}
                                                                alt={clothingItem?.name}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <div className={styles.goodText}>
                                    <p>Эта одежда не используется в образах.</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteModalOpen(false)}
                                disabled={deleteLoading}
                            >
                                Отмена
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={confirmDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isFilterModalOpen && (
                <div className={`modal-overlay ${styles.wardrobeModal}`} onClick={() => setIsFilterModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Фильтры</h2>
                            <button onClick={() => setIsFilterModalOpen(false)} className="none-btn">
                                <X />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {allTags.main && allTags.main.length > 0 && (
                                <div className={styles.filterGroup}>
                                    <h4>Тип одежды</h4>
                                    <div className={styles.filterOptions}>
                                        {allTags.main.map(tag => (
                                            <label key={tag.id}>
                                                <input
                                                    type="checkbox"
                                                    checked={filters.main.includes(tag.id)}
                                                    onChange={() => handleFilterChange('main', tag.id)}
                                                />
                                                {tag.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {allTags.color && allTags.color.length > 0 && (
                                <div className={styles.filterGroup}>
                                    <h4>Цвет</h4>
                                    <div className={styles.filterOptions}>
                                        {allTags.color.map(tag => (
                                            <label key={tag.id}>
                                                <input
                                                    type="checkbox"
                                                    checked={filters.color.includes(tag.id)}
                                                    onChange={() => handleFilterChange('color', tag.id)}
                                                />
                                                {tag.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {allTags.season && allTags.season.length > 0 && (
                                <div className={styles.filterGroup}>
                                    <h4>Сезон</h4>
                                    <div className={styles.filterOptions}>
                                        {allTags.season.map(tag => (
                                            <label key={tag.id}>
                                                <input
                                                    type="checkbox"
                                                    checked={filters.season.includes(tag.id)}
                                                    onChange={() => handleFilterChange('season', tag.id)}
                                                />
                                                {tag.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {allTags.style && allTags.style.length > 0 && (
                                <div className={styles.filterGroup}>
                                    <h4>Стиль</h4>
                                    <div className={styles.filterOptions}>
                                        {allTags.style.map(tag => (
                                            <label key={tag.id}>
                                                <input
                                                    type="checkbox"
                                                    checked={filters.style.includes(tag.id)}
                                                    onChange={() => handleFilterChange('style', tag.id)}
                                                />
                                                {tag.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            {activeFiltersCount > 0 && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={resetFilters}
                                >
                                    Сбросить ({activeFiltersCount})
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={() => setIsFilterModalOpen(false)}
                            >
                                Применить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {filteredClothes.length === 0 ? (
                <p className={styles.emptyMessage}>
                    {clothes.length === 0 ? 'Гардероб пуст' : 'Ничего не найдено по выбранным фильтрам'}
                </p>
            ) : (
                <ul className={styles.wardrobeList}>
                    {filteredClothes.map((item) => (
                        <li key={item.id}>
                            <p className={styles.imageDate}>{new Date(item.created_at).toLocaleDateString('ru-RU')}</p>
                            <div className={styles.imageWrapper}>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image_path}`}
                                    alt={item.name}
                                />
                            </div>
                            <div className={styles.itemTags}>
                                {item.main_tag && (
                                    <span className={`${styles.tag} ${styles['tag-main']}`}>
                                        {item.main_tag.label}
                                    </span>
                                )}
                                {item.tags && item.tags.length > 0 && item.tags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className={`${styles.tag} ${styles.additionalTag}`}
                                    >
                                        {tag.label}
                                    </span>
                                ))}
                            </div>
                            <button
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteClick(item)}
                                title="Удалить"
                            >
                                <Trash2 className={styles.svg} size={18} />
                            </button>
                        </li>
                    ))}
                    <li className={styles.addCloth}>
                        <Link href="/add">
                            <Plus className={styles.addSvg} />
                            <p>Добавить одежду</p>
                        </Link>
                    </li>
                </ul>
            )}
        </div>
    );
}
