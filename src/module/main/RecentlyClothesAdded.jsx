"use client"

import { useState, useEffect, useCallback } from 'react';
import Cookies from "js-cookie";
import styles from "./Main.module.css";
import axios from "axios";
import Loader from "@/module/loader/Loader";

export default function RecentlyClothesAdded() {
    const [recentlyAdded, setRecentlyAdded] = useState([]);
    const [recentlyCount, setRecentlyCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRecent()
    }, []);

    const token = Cookies.get("token");

    const loadRecent = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const headers = {Authorization: `Bearer ${token}`};
            const res = await axios.get(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/clothes/recent`, {headers});
            setRecentlyAdded(res.data.data || []);
            setRecentlyCount(res.data.total || null);
        } catch (err) {
            setError('Ошибка загрузки предметов');
            console.error('Recent error:', err);
        } finally {
            setLoading(false);
        }
    })

    if (loading) {
        return <Loader height={20} size={80} position="relative" />;
    }
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h3>Недавно добавленные предметы ({recentlyCount || 0})</h3>
            {recentlyAdded.length === 0 ? (
                <div className={styles.empty}>Вы пока ничего не добавили</div>
            ) : (
                <div style={{ overflowX: 'scroll', weight: '100%' }}>
                    <ul className={styles.recentlyAddList}>
                        {recentlyAdded.map((item) => (
                            <li key={item.id}>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image_path}`}
                                    alt={item.name}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
