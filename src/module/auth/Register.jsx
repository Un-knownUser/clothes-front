import { useState } from "react";
import axios from "axios";
import styles from "./Auth.module.css";
import Loader from "@/module/loader/Loader";
import { toast } from "sonner";

export default function Register({ onSwitch }) {
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateUsername = (username) => {
        const usernameRegex = /^[a-z0-9]+$/;
        return usernameRegex.test(username);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "username" && value) {
            if (!validateUsername(value)) {
                toast.error(
                    "Имя пользователя должно содержать только маленькие латинские буквы и цифры без пробелов и дефисов",
                    {
                        className: "toast-error",
                        id: "username-validation",
                    }
                );
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!validateUsername(formData.username)) {
            toast.error(
                "Имя пользователя должно содержать только маленькие латинские буквы и цифры без пробелов и дефисов",
                {
                    className: "toast-error",
                    id: "username-validation",
                }
            );
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/register`, formData, {
                headers: { "Content-Type": "application/json" },
            });

            toast.success("Успешная регистрация!", {
                className: "toast-success",
            });

            onSwitch();
        } catch (err) {
            if (err.response?.data?.errors) {
                Object.keys(err.response.data.errors).forEach((field) => {
                    err.response.data.errors[field].forEach((message, index) => {
                        toast.error(message, {
                            className: "toast-error",
                            id: `${field}-${index}`,
                        });
                    });
                });
            } else {
                toast.error(err.response?.data?.message || "Произошла ошибка при регистрации", {
                    className: "toast-error",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.authForm}>
                <form onSubmit={handleSubmit} className="flex-column-sm">
                    <h2>Регистрация</h2>
                    <div className="form-group field">
                        <input
                            className="form-field"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Имя пользователя"
                            required
                        />
                        <label htmlFor="username" className="form-label">Имя пользователя</label>
                    </div>
                    <div className="form-group field">
                        <input
                            className="form-field"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Имя"
                            required
                        />
                        <label htmlFor="name" className="form-label">Имя</label>
                    </div>
                    <div className="form-group field">
                        <input
                            className="form-field"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Почта"
                            required
                        />
                        <label htmlFor="email" className="form-label">Почта</label>
                    </div>
                    <div className="form-group field">
                        <input
                            className="form-field"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Пароль"
                            required
                        />
                        <label htmlFor="password" className="form-label">Пароль</label>
                    </div>
                    <div className="form-group field">
                        <input
                            className="form-field"
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            placeholder="Подтвердите пароль"
                            required
                        />
                        <label htmlFor="password_confirmation" className="form-label">Подтвердите пароль</label>
                    </div>
                    <button type="submit" className="btn btn-secondary" disabled={loading}>
                        {loading ? "Загрузка..." : "Регистрация"}
                    </button>
                </form>
                <div className={styles.authButtonSwitch}>
                    <button onClick={onSwitch} className="none-btn">Или вход</button>
                </div>
                {loading && (
                    <div className={styles.authLoader}>
                        <Loader />
                    </div>
                )}
            </div>
        </>
    );
}