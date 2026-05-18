"use client"

import styles from './OutfitModal.module.css';
import { X } from "lucide-react";
import {useState} from "react";
import ImageLightbox from "@/module/imageLightbox/ImageLightbox";

export default function OutfitModal({ outfit, isOpen, onClose, status }) {
    const [fullScreenImage, setFullScreenImage] = useState(null);

    if (!isOpen || !outfit) return null;

    const clothing = outfit.clothing || [];

    const getCategoryForItem = (item) => {
        return item.main_tag.label || 'Другое';
    };

    const groupedClothes = clothing.reduce((acc, item) => {
        if (!item || !item.id) return acc;
        const category = getCategoryForItem(item);
        acc[category] = acc[category] || [];
        acc[category].push(item);
        return acc;
    }, {});

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className={`${styles.modal} ${styles[status]}`} onClick={e => e.stopPropagation()}>
                    <div className={styles.header}>
                        <h2>{outfit.name}</h2>
                        <button onClick={onClose} className="none-btn">
                            <X />
                        </button>
                    </div>
                    {clothing.length > 0 ? (
                        <>
                            <div className={styles.zonesGrid}>
                                {Object.entries(groupedClothes).map(([category, items]) => (
                                    <div key={category} className={styles.zoneGroup}>
                                        <h4>{category} ({items.length})</h4>
                                        <div className={styles.zoneItems}>
                                            {items.map((item) => {
                                                const imgUrl = `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image_path}`;
                                                return (
                                                    <div key={item.id}>
                                                        <img
                                                            src={imgUrl}
                                                            alt={item.name || 'Одежда'}
                                                            className={styles.modalClothingImg}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => setFullScreenImage(imgUrl)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>
                            Одежда не загружена в этом образе
                        </p>
                    )}
                </div>
            </div>
            <ImageLightbox
                isOpen={!!fullScreenImage}
                src={fullScreenImage}
                onClose={() => setFullScreenImage(null)}
            />
        </>
    );
}
