"use client"

import {useState} from 'react';
import Login from '@/module/auth/Login';
import Register from '@/module/auth/Register';
import styles from '@/module/auth/Auth.module.css';

export default function Page() {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <>
            <div className={styles.authContainer}>
                <div className={styles.authFormContainer}>
                    {isLogin ? (
                        <Login onSwitch={toggleForm} />
                    ) : (
                        <Register onSwitch={toggleForm} />
                    )}
                </div>
            </div>
        </>
    );
}
