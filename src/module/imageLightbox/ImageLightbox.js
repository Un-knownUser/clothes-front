'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ImageLightbox.module.css';

export default function ImageLightbox({ src, alt, isOpen, onClose }) {
    // Закрытие по нажатию на Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !src) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className={`none-btn ${styles.closeBtn}`}>
                    <X color="#fff" size={32} />
                </button>
                <img src={src} alt={alt || 'Full screen image'} className={styles.image} />
            </div>
        </div>
    );
}