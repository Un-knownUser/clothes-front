import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import styles from "./Auth.module.css";
import Loader from "@/module/loader/Loader";
import { toast } from "sonner";
import { OTPInput } from "input-otp";

export default function Login({ onSwitch }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [is2FA, setIs2FA] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const isSubmitting = useRef(false);

    // Обновление данных формы
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Фокусировка на OTP-поле при отображении 2FA
    useEffect(() => {
        if (is2FA) {
            document.querySelector("input[autocomplete='one-time-code']")?.focus();
        }
    }, [is2FA]);

    // Мемоизация handle2FASubmit
    const handle2FASubmit = useCallback(
        async (e) => {
            if (e && e.preventDefault) e.preventDefault();

            if (loading || isSubmitting.current || otpCode.length < 6) return;

            isSubmitting.current = true;
            setLoading(true);

            try {
                const { data } = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/verify-otp`,
                    { email: formData.email, otp_code: otpCode },
                    { headers: { "Content-Type": "application/json" }, withCredentials: true }
                );

                Cookies.set("token", data.token);
                Cookies.set("username", data.user.name);
                window.dispatchEvent(new Event("auth-change"));

                toast.success("Успешный вход!", {
                    className: "toast-success",
                });
                await router.push("/main");
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
                    toast.error(err.response?.data?.message || "Произошла ошибка при подтверждении OTP", {
                        className: "toast-error",
                    });
                    setLoading(false);
                    isSubmitting.current = false;
                    setOtpCode("");
                }
            } finally {
                setLoading(false);
            }
        },
        [otpCode, formData.email, router, loading]
    );

    // Отправка данных для входа
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);

        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, formData, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            if (data.message.includes("OTP")) {
                setIs2FA(true);
                toast.info("OTP-код отправлен на ваш email!", {
                    className: "toast-info",
                });
            }
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
                toast.error(err.response?.data?.message || "Произошла ошибка при входе", {
                    className: "toast-error",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (otpCode.length === 6 && !loading && !isSubmitting.current) {
            const fakeEvent = { preventDefault: () => {} };
            handle2FASubmit(fakeEvent);
        }
    }, [otpCode, handle2FASubmit]);

    return (
        <>
            <div className={styles.authForm}>
                {!is2FA ? (
                    <>
                        <form onSubmit={handleSubmit} className="flex-column-sm">
                            <h2>Вход</h2>
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
                            <button type="submit" className="btn btn-secondary" disabled={loading}>
                                {loading ? "Загрузка..." : "Вход"}
                            </button>
                        </form>
                        <div className={styles.authButtonSwitch}>
                            <button onClick={onSwitch} className="none-btn">Или регистрация</button>
                        </div>
                        {loading && (
                            <div className={styles.authLoader}>
                                <Loader />
                            </div>
                        )}
                    </>
                ) : (
                    <form onSubmit={handle2FASubmit} className={`flex-column-sm ${styles.otpForm}`}>
                        <h2>Подтвердите, что это вы</h2>
                        <p>Мы отправили код на вашу почту</p>
                        <div className={styles.otpContainer}>
                            <OTPInput
                                maxLength={6}
                                pattern={/^[0-9]+$/}
                                onChange={setOtpCode}
                                value={otpCode}
                                render={({ slots }) => (
                                    <div className={styles.otpDisplayContainer}>
                                        {slots.map((slot, idx) => (
                                            <div
                                                key={idx}
                                                className={`${styles.otpDisplay} ${
                                                    slot.isActive ? styles.otpDisplayActive : ""
                                                }`}
                                            >
                                                {slot.char || ""}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn"
                            disabled={loading || otpCode.length < 6}
                        >
                            {loading ? "Загрузка..." : "Подтвердить"}
                        </button>
                        {loading && (
                            <div className={styles.authLoader}>
                                <Loader />
                            </div>
                        )}
                    </form>
                )}
            </div>
        </>
    );
}