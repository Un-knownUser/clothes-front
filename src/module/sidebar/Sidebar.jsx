"use client";

import { House, Plus, PackageOpen, Shirt, User, CirclePlus } from 'lucide-react';
import styles from "./Sidebar.module.css";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (pathname === '/' || pathname === '/login' || pathname === '/register') {
        return null;
    }

    return (
        <>
            <ul className={styles.sidebar}>
                <li className={`${styles.sidebarItem} ${pathname === "/main" ? styles.active : ''}`}>
                    <Link href="/main">
                        <House />
                        <span>Главная</span>
                    </Link>
                </li>
                <li className={`${styles.sidebarItem} ${pathname === "/my-wardrobe" ? styles.active : ''}`}>
                    <Link href="/my-wardrobe">
                        <PackageOpen />
                        <span>Гардероб</span>
                    </Link>
                </li>
                <li className={`${styles.sidebarItem} ${styles.add}`}>
                    <button onClick={toggleModal} className={`${styles.addButton} ${isModalOpen ? styles.active : ''}`}>
                        <Plus />
                    </button>
                </li>
                <li className={`${styles.sidebarItem} ${pathname === "/my-outfits" ? styles.active : ''}`}>
                    <Link href="/my-outfits">
                        <Shirt />
                        <span>Образы</span>
                    </Link>
                </li>
                <li className={`${styles.sidebarItem} ${pathname === "/profile" ? styles.active : ''}`}>
                    <Link href="/profile">
                        <User />
                        <span>Профиль</span>
                    </Link>
                </li>
            </ul>

            {isModalOpen && (
                    <div className={`${styles.modalOverlay} modal-overlay`} onClick={toggleModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <Link href="/add" onClick={closeModal}>
                            <CirclePlus />
                            <p>Добавить одежду</p>
                        </Link>
                        <Link href="/outfits" onClick={closeModal}>
                            <Shirt />
                            <p>Создать образ</p>
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
