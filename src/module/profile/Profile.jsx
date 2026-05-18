"use client";

import { useState, useEffect } from "react";
import {LogOut, ChevronRight, Edit2, X, Camera} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import styles from "./Profile.module.css";
import Link from "next/link";
import Loader from "@/module/loader/Loader";
import {toast} from "sonner";

export default function Profile() {
    const [token, setToken] = useState("");
    const [user, setUser] = useState(null);
    const [clothes, setClothes] = useState([]);
    const [outfits, setOutfits] = useState([]);
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", username: "", email: "" });
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        const savedToken = Cookies.get("token");
        if (!savedToken) {
            setLoading(false);
            return;
        }

        setToken(savedToken);

        const headers = { Authorization: `Bearer ${savedToken}` };

        Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, { headers }),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/clothes`, { headers }),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/outfits`, { headers }),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/likes`, { headers }),
        ])
            .then(([userRes, clothesRes, outfitsRes, likesRes]) => {
                setUser(userRes.data);
                setClothes(clothesRes.data.data || clothesRes.data || []);
                setOutfits(outfitsRes.data.data || outfitsRes.data || []);
                setLikes(likesRes.data.data || likesRes.data || []);
            })
            .catch((err) => {
                console.error("Ошибка загрузки профиля:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        Cookies.remove("token");
        window.location.href = "/auth";
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const formData = new FormData();
            formData.append("name", editForm.name);
            formData.append("username", editForm.username);
            formData.append("email", editForm.email);
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setUser(res.data.user);
            setIsEditModalOpen(false);
            setAvatarFile(null);
            toast.success("Профиль успешно обновлен");
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при обновлении");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenEditModal = () => {
        setEditForm({
            name: user.name || "",
            username: user.username || "",
            email: user.email || ""
        });
        setAvatarFile(null); // Сбрасываем выбранный файл, если он был
        setIsEditModalOpen(true);
    };

    if (loading) {
        return <Loader height={100} size={80} position="absolute" />;
    }

    return (
        <div className="flex-column-sm">
            <div className={styles.header}>
                <button
                    onClick={handleOpenEditModal}
                    className={`none-btn ${styles.editIconBtn}`}
                >
                    <Edit2 size={18} />
                </button>
                <div className={styles.userProfileSection}>
                    <div className={styles.avatarWrapper}>
                        {user.image_url ? (
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/${user.image_url}`}
                                alt="Avatar"
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className={styles.userInfo}>
                        <h2>{user.name}</h2>
                        <p className={styles.username}>@{user.username}</p>
                        {user.role === "admin" && (
                            <Link href="/admin/users" className="btn btn-primary">
                                Панель администратора
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.myStats}>
                <ul className={styles.stats}>
                    <li>
                        <Link href="/my-wardrobe">
                            <div className={styles.statsName}>
                                <p>Мой гардероб</p>
                                <ChevronRight />
                            </div>
                            <h2>{clothes.length}</h2>
                        </Link>
                    </li>
                    <li><span></span></li>
                    <li>
                        <Link href="/my-outfits">
                            <div className={styles.statsName}>
                                <p>Мои образы</p>
                                <ChevronRight />
                            </div>
                            <h2>{outfits.length}</h2>
                        </Link>
                    </li>
                    <li><span></span></li>
                    <li>
                        <Link href="/my-likes">
                            <div className={styles.statsName}>
                                <p>Мои лайки</p>
                                <ChevronRight />
                            </div>
                            <h2>{likes.length}</h2>
                        </Link>
                    </li>
                </ul>
            </div>
            <div>
                <button onClick={handleLogout} className={`btn ${styles.logoutBtn}`}>
                    <LogOut size={20} /> Выйти
                </button>
            </div>

            {/* Модальное окно редактирования */}
            {isEditModalOpen && (
                <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Редактировать профиль</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="none-btn">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className={styles.editForm}>
                            <div className={styles.avatarUploadGroup}>
                                <label className={styles.avatarUploadLabel}>
                                    <div className={styles.avatarPreview}>
                                        {avatarFile ? (
                                            <img src={URL.createObjectURL(avatarFile)} alt="Preview" />
                                        ) : user.image_url ? (
                                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/${user.image_url}`} alt="Current" />
                                        ) : (
                                            <></>
                                        )}
                                        <div className={styles.avatarOverlay}>
                                            <Camera />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => setAvatarFile(e.target.files[0])}
                                    />
                                </label>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Имя</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Имя пользователя (Никнейм)</label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                                {isUpdating ? "Сохранение..." : "Сохранить"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}