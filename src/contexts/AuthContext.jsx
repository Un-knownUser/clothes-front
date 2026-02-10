"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedToken = Cookies.get('token');
        if (savedToken) {
            setToken(savedToken);
        }
    }, []);

    const login = (newToken, userData) => {
        Cookies.set('token', newToken, { expires: 7 }); // 7 дней
        Cookies.set('username', userData.username);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        Cookies.remove('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
