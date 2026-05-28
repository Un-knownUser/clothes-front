import { Trash2 } from "lucide-react";
import styles from "./Wardrobe.module.css";

export default function ClothingCard({ item, onClickImage, onDeleteClick }) {
    const imgUrl = `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image_path}`;

    return (
        <li>
            <p className={styles.imageDate}>
                {new Date(item.created_at).toLocaleDateString('ru-RU')}
            </p>
            <div className={styles.imageWrapper}>
                <img
                    src={imgUrl}
                    alt={item.name || 'Одежда'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onClickImage(imgUrl)}
                />
            </div>
            <div className={styles.itemTags}>
                {item.main_tag && (
                    <span className={`${styles.tag} ${styles['tag-main']}`}>
                        {item.main_tag.label}
                    </span>
                )}
                {item.tags && item.tags.length > 0 && item.tags.map(tag => (
                    <span key={tag.id} className={`${styles.tag} ${styles.additionalTag}`}>
                        {tag.label}
                    </span>
                ))}
            </div>
            <button className={styles.deleteBtn} onClick={() => onDeleteClick(item)} title="Удалить">
                <Trash2 className={styles.svg} size={18} />
            </button>
        </li>
    );
}