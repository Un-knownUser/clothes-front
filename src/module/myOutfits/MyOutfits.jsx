"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import styles from './MyOutfits.module.css';
import Loader from "@/module/loader/Loader";
import Link from "next/link";

export default function MyOutfits() {
    const [outfits, setOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

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
                `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits`,
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

    const handleDelete = async (id) => {
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits/${id}`,
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Сегодня';
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн. назад`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} нед. назад`;
        }

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    if (loading) {
        return <Loader height={100} size={80} position="absolute" />;
    }

    return (
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
                                    <div className={styles.clothingLine}>
                                        {outfit.clothing.map(item => (
                                            <div key={item.id} className={styles.clothingItem}>
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image_path}`}
                                                    alt={item.name}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyPreview}>
                                        <p>Нет вещей</p>
                                    </div>
                                )}
                            </div>

                            <div className={styles.outfitInfo}>
                                <h4>{outfit.name}</h4>
                                <div className={styles.outfitMeta}>
                                    <span className={styles.count}>
                                        {outfit.clothing?.length || 0} {outfit.clothing?.length === 1 ? 'вещь' : 'вещей'}
                                    </span>
                                    <span className={styles.date}>{formatDate(outfit.created_at)}</span>
                                </div>
                            </div>

                            <div className={styles.outfitActions}>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => setDeleteConfirm(outfit.id)}
                                    title="Удалить"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                        <h3>Удалить образ?</h3>
                        <p>Это действие нельзя отменить</p>
                        <div className={styles.confirmActions}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteConfirm(null)}
                            >
                                Отмена
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleDelete(deleteConfirm)}
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
