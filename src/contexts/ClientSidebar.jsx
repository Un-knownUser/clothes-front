"use client";
import { useState, useEffect } from 'react';
import Sidebar from '@/module/sidebar/Sidebar';
import Cookies from "js-cookie";

export default function ClientSidebar() {
    const [token, setToken] = useState(null); // Изначально всегда null
    const [isMounted, setIsMounted] = useState(false); // Флаг того, что клиент готов

    useEffect(() => {
        // Как только компонент "смонтирован", мы понимаем, что мы на клиенте
        setIsMounted(true);
        setToken(Cookies.get("token"));

        const checkToken = () => setToken(Cookies.get("token"));

        window.addEventListener("auth-change", checkToken);
        window.addEventListener("focus", checkToken);

        return () => {
            window.removeEventListener("auth-change", checkToken);
            window.removeEventListener("focus", checkToken);
        };
    }, []);

    // Если мы еще на этапе SSR (сервера) или первой гидратации — ничего не рисуем
    if (!isMounted) {
        return null;
    }

    // Теперь, когда клиент "проснулся", рисуем Sidebar, если есть токен
    return token ? <Sidebar /> : null;
}