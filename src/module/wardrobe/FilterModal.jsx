import { X } from "lucide-react";
import styles from "./Wardrobe.module.css";

export default function FilterModal({isOpen, onClose, allTags, filters, handleFilterChange, resetFilters, activeFiltersCount }) {
    if (!isOpen) return null;

    const renderFilterGroup = (title, groupName, tags) => {
        if (!tags || tags.length === 0) return null;
        return (
            <div className={styles.filterGroup}>
                <h4>{title}</h4>
                <div className={styles.filterOptions}>
                    {tags.map(tag => (
                        <label key={tag.id}>
                            <input
                                type="checkbox"
                                checked={filters[groupName].includes(tag.id)}
                                onChange={() => handleFilterChange(groupName, tag.id)}
                            />
                            {tag.label}
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={`modal-overlay ${styles.wardrobeModal}`} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Фильтры</h2>
                    <button onClick={onClose} className="none-btn"><X /></button>
                </div>

                <div className={styles.modalBody}>
                    {renderFilterGroup("Тип одежды", "main", allTags.main)}
                    {renderFilterGroup("Цвет", "color", allTags.color)}
                    {renderFilterGroup("Сезон", "season", allTags.season)}
                    {renderFilterGroup("Стиль", "style", allTags.style)}
                </div>

                <div className={styles.modalFooter}>
                    {activeFiltersCount > 0 && (
                        <button className="btn btn-secondary" onClick={resetFilters}>
                            Сбросить ({activeFiltersCount})
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={onClose}>
                        Применить
                    </button>
                </div>
            </div>
        </div>
    );
}