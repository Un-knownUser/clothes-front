"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './Auth.module.css';
import {useRouter, useSearchParams} from "next/navigation";
import {useAuth} from "@/contexts/AuthContext";
import axios from "axios";

export default function Login() {
    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "/main";

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.username || !formData.password) return setError('Заполните все поля');

        setIsLoading(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/login`, formData);
            login(res.data.token, res.data.user);
            router.push(from);
        } catch {
            setError('Ошибка входа');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>Вход</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group field">
                        <input
                            type="input"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="form-field"
                            placeholder="Логин"
                            required
                            disabled={isLoading}
                        />
                        <label htmlFor="name" className="form-label">Логин</label>
                    </div>
                    <div className="form-group field">
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="form-field"
                            placeholder="Пароль"
                            required
                            disabled={isLoading}
                        />
                        <label htmlFor="name" className="form-label">Пароль</label>
                    </div>

                    {error && <p>{error}</p>}
                    <button type="submit" className="btn btn-auth" disabled={isLoading}>
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                <p className={styles.footer}>
                    Нет аккаунта? <Link href="/register" className={styles.link}>Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
}
