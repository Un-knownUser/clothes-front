"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './Auth.module.css';
import {useAuth} from "@/contexts/AuthContext";
import {useRouter} from "next/navigation";
import axios from "axios";

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!Object.values(formData).every(Boolean)) return setError('Заполните все поля');
        if (formData.password !== formData.password_confirmation) return setError('Пароли не совпадают');

        setIsLoading(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/register`, formData);
            login(res.data.token, res.data.user);
            router.push('/');
        } catch {
            setError('Ошибка регистрации');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>Регистрация</h1>
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
                            type="input"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="form-field"
                            placeholder="Имя"
                            required
                            disabled={isLoading}
                        />
                        <label htmlFor="name" className="form-label">Имя</label>
                    </div>
                    <div className="form-group field">
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="form-field"
                            placeholder="Почта"
                            required
                            disabled={isLoading}
                        />
                        <label htmlFor="name" className="form-label">Почта</label>
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
                    <div className="form-group field">
                        <input
                            type="password"
                            value={formData.password_confirmation}
                            onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                            className="form-field"
                            placeholder="Подтвердите пароль"
                            required
                            disabled={isLoading}
                        />
                        <label htmlFor="name" className="form-label">Подтвердите пароль</label>
                    </div>

                    {error && <p>{error}</p>}
                    <button type="submit" className="btn" disabled={isLoading}>
                        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p className={styles.footer}>
                    Уже есть аккаунт? <Link href="/login" className={styles.link}>Войти</Link>
                </p>
            </div>
        </div>
    );
}
