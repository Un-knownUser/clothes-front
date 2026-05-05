"use client";

import { useState, useEffect } from "react";
import { LogOut, ChevronRight } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import styles from "./Profile.module.css";
import Link from "next/link";
import Loader from "@/module/loader/Loader";

export default function Profile() {
    const [token, setToken] = useState("");
    const [user, setUser] = useState(null);
    const [clothes, setClothes] = useState([]);
    const [outfits, setOutfits] = useState([]);
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = Cookies.get("token");
        if (!savedToken) {
            setLoading(false);
            return;
        }

        setToken(savedToken);

        const headers = { Authorization: `Bearer ${savedToken}` };

        Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/user`, { headers }),
            axios.get(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/clothes`, { headers }),
            axios.get(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits`, { headers }),
            axios.get(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/likes`, { headers }),
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

    if (loading) {
        return <Loader height={100} size={80} position="absolute" />;
    }

    return (
        <div className="flex-column-sm">
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <h2>{user.name || "Пользователь"}</h2>
                    <p>{user.email}</p>
                    {user.role === "admin" && (
                        <Link href="/admin/users" className="btn btn-primary">Панель администратора</Link>
                    )}
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
                    <LogOut size={20} />
                    Выйти
                </button>
            </div>
        </div>
    );
}
