'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, HeartOff, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import Loader from "@/module/loader/Loader";
import styles from './PublicOutfits.module.css';
import filterBadWords from "./filterBadWords";

export default function PublicOutfits() {
    const [outfits, setOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLikes, setUserLikes] = useState(new Set());

    // Состояние модалки и комментариев
    const [selectedOutfit, setSelectedOutfit] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const commentsEndRef = useRef(null);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        loadUserLikes();
        fetchPublicOutfits();
    }, []);

    useEffect(() => {
        if (comments.length > 0) scrollToBottom();
    }, [comments]);

    const loadUserLikes = async () => {
        const token = Cookies.get('token');
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/user-liked-outfits`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const likedIds = await res.json();
                setUserLikes(new Set(likedIds));
            }
        } catch (error) {
            console.error('Ошибка лайков:', error);
        }
    };

    const fetchPublicOutfits = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/public-outfits`);
            const data = await res.json();
            setOutfits(data.data || []);
        } catch (error) {
            toast.error('Ошибка загрузки ленты');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (outfitId) => {
        setIsCommentsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits/${outfitId}/comments`);
            const data = await res.json();
            setComments(data);
        } catch (e) {
            toast.error("Не удалось загрузить комментарии");
        } finally {
            setIsCommentsLoading(false);
        }
    };

    const handleOpenDetails = (outfit) => {
        setSelectedOutfit(outfit);
        fetchComments(outfit.id);
    };

    const toggleLike = async (e, outfitId) => {
        e.stopPropagation(); // Чтобы не открывалась модалка при клике на лайк
        const token = Cookies.get('token');
        if (!token) return toast.error('Войдите в аккаунт');

        const isLiked = userLikes.has(outfitId);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits/${outfitId}/like`, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setUserLikes(prev => {
                    const newSet = new Set(prev);
                    isLiked ? newSet.delete(outfitId) : newSet.add(outfitId);
                    return newSet;
                });
                // Оптимистичное обновление счетчика в локальном стейте
                setOutfits(prev => prev.map(o =>
                    o.id === outfitId
                        ? { ...o, likes_count: isLiked ? o.likes_count - 1 : o.likes_count + 1 }
                        : o
                ));
            }
        } catch (error) {
            toast.error('Ошибка соединения');
        }
    };

    const handleSendComment = async () => {
        const token = Cookies.get('token');
        if (!token) return toast.error("Войдите, чтобы комментировать");
        if (!newComment.trim() || isSending) return;

        setIsSending(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits/${selectedOutfit.id}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newComment })
            });
            if (res.ok) {
                const savedComment = await res.json();
                setComments(prev => [...prev, savedComment]);
                setNewComment("");
            }
        } catch (e) {
            toast.error("Ошибка отправки");
        } finally {
            setIsSending(false);
        }
    };

    if (loading) return <Loader height={100} size={80} position="absolute" />;

    return (
        <div className="flex-column-sm">
            <h2>Публичные сборки</h2>

            <div className={styles.outfitsList}>
                {outfits.map((outfit) => (
                    <div key={outfit.id} className={styles.outfitCard} onClick={() => handleOpenDetails(outfit)}>
                        <div className={styles.cardHeader}>
                            <h3>{outfit.name} <span className={styles.temp}>({outfit.deg}°C)</span></h3>
                        </div>

                        <div className={styles.imagePreview}>
                            {outfit.clothing.slice(0, 3).map((item, idx) => (
                                <img
                                    key={item.id}
                                    src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image_path}`}
                                    alt=""
                                />
                            ))}
                            {outfit.clothing.length > 3 && (
                                <div className={styles.moreBadge}>+{outfit.clothing.length - 3}</div>
                            )}
                        </div>

                        <div className={styles.cardFooter}>
                            <span className={styles.outfitAuthor}>@{outfit.user.name}</span>
                            <div className={styles.likeSection} onClick={(e) => toggleLike(e, outfit.id)}>
                                {userLikes.has(outfit.id) ? <HeartOff size={18} color="#ff4d4d" /> : <Heart size={18} />}
                                <span className={styles.likesCount}>{outfit.likes_count}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Модальное окно деталей */}
            {selectedOutfit && (
                <div className="modal-overlay" onClick={() => setSelectedOutfit(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedOutfit(null)} className={`none-btn ${styles.close}`}>
                            <X />
                        </button>
                        <div className={styles.modalGrid}>
                            <div className={styles.modalGallery}>
                                {selectedOutfit.clothing.map(item => (
                                    <img
                                        key={item.id}
                                        src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image_path}`}
                                        alt={item.name}
                                    />
                                ))}
                            </div>

                            <div className={styles.modalSidebar}>
                                <div className={styles.sidebarHeader}>
                                    <h3>{selectedOutfit.name}</h3>
                                    <p className={styles.outfitAuthor}>Автор: {selectedOutfit.user.name}</p>
                                </div>

                                <div className={styles.commentsList}>
                                    {isCommentsLoading ? <Loader size={30} /> : (
                                        comments.map(c => (
                                            <div key={c.id} className={styles.comment}>
                                                <span className={styles.commentUser}>{c.user.name}</span>
                                                <p className={styles.commentText}>{filterBadWords(c.content)}</p>
                                                <span className={styles.commentDate}>
                                                    {new Date(c.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                    <div ref={commentsEndRef} />
                                </div>

                                <div className={styles.commentInputWrapper}>
                                    <div className={styles.commentInput}>
                                        <input
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Написать комментарий..."
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                            disabled={isSending}
                                        />
                                        <button onClick={handleSendComment} disabled={isSending}>
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}