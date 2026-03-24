'use client';
import {useState, useEffect, useCallback} from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import Loader from "@/module/loader/Loader";
import styles from './PublicOutfits.module.css';

export default function PublicOutfits() {
    const [outfits, setOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLikes, setUserLikes] = useState(new Set());

    const [openIndex, setOpenIndex] = useState(-1);

    useEffect(() => {
        loadUserLikes();
        fetchPublicOutfits();
    }, []);

    const loadUserLikes = async () => {
        const token = Cookies.get('token');
        if (!token) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/user-liked-outfits`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const likedOutfits = await res.json();
                setUserLikes(new Set(likedOutfits.map(id => id)));
            }
        } catch (error) {
            console.error('Ошибка загрузки лайков:', error);
        }
    };

    const fetchPublicOutfits = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/public-outfits`);
            const data = await res.json();
            setOutfits(data.data || []);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLike = async (outfitId) => {
        const token = Cookies.get('token');
        if (!token) {
            toast.error('Войдите в аккаунт');
            return;
        }

        const isLiked = userLikes.has(outfitId);
        const method = isLiked ? 'DELETE' : 'POST';
        const url = `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits/${outfitId}/like`;

        try {
            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setUserLikes(prev => {
                    const newSet = new Set(prev);
                    if (isLiked) {
                        newSet.delete(outfitId);
                    } else {
                        newSet.add(outfitId);
                    }
                    return newSet;
                });
                toast.success(isLiked ? 'Лайк убран' : 'Лайк добавлен');
            }
        } catch (error) {
            toast.error('Ошибка лайка');
        }
    };

    const openLightbox = useCallback((outfitIndex) => {
        setOpenIndex(outfitIndex);
    }, []);

    const closeLightbox = () => {
        setOpenIndex(-1);
    };

    if (loading) {
        return <Loader height={100} size={80} position="absolute" />;
    }

    return (
        <div className="flex-column-sm">
            <h2>Публичные сборки</h2>
            <ul className={styles.outfitsList}>
                {outfits.map((outfit, outfitIndex) => (
                    <li key={outfit.id} className={styles.outfitCard}>
                        <div className={styles.cardHeader}>
                            <h3>{outfit.name}</h3>
                            <span className={styles.tempBadge}>({outfit.deg}°C)</span>
                        </div>
                        <div className={styles.outfitClothing}>
                            {outfit.clothing.map((item) => (
                                <img
                                    key={item.id}
                                    src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image_path}`}
                                    alt={item.name}
                                    className={styles.clothingImage}
                                    onClick={() => openLightbox(outfitIndex)}
                                />
                            ))}
                        </div>
                        <div className={styles.outfitInfo}>
                            <div className={styles.outfitAuthor}>Автор: {outfit.user.name}</div>
                            <div className={styles.likeSection}>
                                <button
                                    onClick={() => toggleLike(outfit.id)}
                                    className={`${styles.likeBtn} ${userLikes.has(outfit.id) ? styles.liked : ''}`}
                                    title={userLikes.has(outfit.id) ? 'Убрать лайк' : 'Лайкнуть'}
                                >
                                    {userLikes.has(outfit.id) ?
                                        <HeartOff size={20} /> :
                                        <Heart size={20} />
                                    }
                                </button>
                                <span className={styles.likesCount}>{outfit.likes_count}</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {openIndex >= 0 && outfits[openIndex] && (
                <Lightbox
                    open={true}
                    close={closeLightbox}
                    slides={outfits[openIndex].clothing.map(item => ({
                        src: `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image_path}`,
                        title: item.name,
                        width: 800,
                        height: 600
                    }))}
                    index={0}
                    plugins={[Zoom, Thumbnails]}
                />
            )}

            {outfits.length === 0 && (
                <div className={styles.emptyState}>
                    <p>Публичных сборок пока нет</p>
                </div>
            )}
        </div>
    );
}
