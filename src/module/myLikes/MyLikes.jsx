"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Heart, HeartOff } from 'lucide-react';
import { toast } from 'sonner';
import styles from './MyLikes.module.css';
import Loader from "@/module/loader/Loader";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL;

export default function MyLikes() {
    const [outfits, setOutfits] = useState([]);
    const [userLikes, setUserLikes] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchAllData = async () => {
            const headers = { Authorization: `Bearer ${token}` };

            try {
                const [outfitsRes, likesIdsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/likes`, { headers }),
                    axios.get(`${API_URL}/api/user-liked-outfits`, { headers })
                ]);

                setOutfits(outfitsRes.data.data);
                setUserLikes(new Set(likesIdsRes.data));
            } catch (error) {
                console.error('Ошибка загрузки:', error);
                toast.error('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [router]);

    const toggleLike = async (e, outfitId) => {
        e.preventDefault();
        e.stopPropagation();

        const token = Cookies.get('token');
        if (!token) return toast.error('Войдите в аккаунт');

        const isLiked = userLikes.has(outfitId);

        // Оптимистичное обновление UI
        setUserLikes(prev => {
            const newSet = new Set(prev);
            isLiked ? newSet.delete(outfitId) : newSet.add(outfitId);
            return newSet;
        });

        // Фоновый запрос на сервер
        try {
            await axios({
                method: isLiked ? 'DELETE' : 'POST',
                url: `${API_URL}/api/outfits/${outfitId}/like`,
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            // Откат при ошибке сети/сервера
            setUserLikes(prev => {
                const newSet = new Set(prev);
                isLiked ? newSet.add(outfitId) : newSet.delete(outfitId);
                return newSet;
            });
            toast.error('Ошибка при обновлении лайка');
        }
    };

    if (loading) {
        return <Loader height={100} size={80} position="absolute" />;
    }

    return (
        <div className="flex-column-sm">
            <div className={styles.header}>
                <h2>Мои лайки ({outfits.length})</h2>
            </div>

            <div className={styles.outfitsList}>
                {outfits.map((outfit) => {
                    const isLiked = userLikes.has(outfit.id);

                    return (
                        <div key={outfit.id} className={styles.outfitCard}>
                            <div className={styles.cardHeader}>
                                <h3>{outfit.name} <span className={styles.temp}>({outfit.deg}°C)</span></h3>
                            </div>

                            <div className={styles.imagePreview}>
                                {outfit.clothing.slice(0, 3).map((item) => (
                                    <img
                                        key={item.id}
                                        src={`${API_URL}/storage/${item.image_path}`}
                                        alt={item.name || 'Элемент одежды'}
                                    />
                                ))}
                                {outfit.clothing.length > 3 && (
                                    <div className={styles.moreBadge}>+{outfit.clothing.length - 3}</div>
                                )}
                            </div>

                            <div className={styles.cardFooter}>
                                <span className={styles.outfitAuthor}>@{outfit.user.name}</span>
                                <button
                                    className={styles.likeSection}
                                    onClick={(e) => toggleLike(e, outfit.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                    {isLiked ? <HeartOff size={18} color="#ff4d4d" /> : <Heart size={18} />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}