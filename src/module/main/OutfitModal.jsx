import styles from './OutfitModal.module.css';
import {ThermometerSun, X} from "lucide-react";

export default function OutfitModal({ outfit, isOpen, onClose, status }) {
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
                                            {items.map((item) => (
                                                <div key={item.id}>
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image_path}`}
                                                        alt={item.name || 'Одежда'}
                                                        className={styles.modalClothingImg}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.outfitTemp}>
                                <ThermometerSun />
                                <p>{outfit.deg || 'N/A'}°C</p>
                            </div>
                        </>
                    ) : (
                        <p>
                            Одежда не загружена в этом образе
                        </p>
                    )}
            </div>
        </div>
    );
}
