"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast } from 'sonner';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }) {
    const [isMounted, setIsMounted] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false); // Состояние проверки прав
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        const token = Cookies.get('token');

        if (!token) {
            router.push('/login');
            return;
        }

        const verifyAdmin = async () => {
            try {
                // Запрашиваем данные текущего пользователя
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/user`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Проверяем роль (измените под структуру вашей БД: data.is_admin или data.role)
                if (data.role === 'admin' || data.is_admin === true) {
                    setIsAuthorized(true);
                } else {
                    toast.error('Доступ запрещен. Необходимы права администратора.');
                    router.push('/'); // Выкидываем обычного юзера на главную
                }
            } catch (error) {
                console.error('Ошибка авторизации:', error);
                Cookies.remove('token'); // Если токен протух
                router.push('/login');
            }
        };

        verifyAdmin();
    }, [router]);

    // Пока идет проверка (на клиенте) или загрузка данных, не рендерим саму админку,
    // чтобы не было "моргания" интерфейса перед редиректом
    if (!isMounted || !isAuthorized) {
        return (
            <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <p>Проверка прав доступа...</p>
            </div>
        );
    }

    return (
        <div className={styles.adminContainer}>
            <aside className={styles.sidebar}>
                <nav className={styles.nav}>
                    <Link href="/admin/users" className={pathname.includes('/users') ? styles.active : ''}>
                        Пользователи
                    </Link>
                    <Link href="/admin/tags" className={pathname.includes('/tags') ? styles.active : ''}>
                        Теги
                    </Link>
                </nav>
            </aside>
            <div className={styles.mainContent}>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}