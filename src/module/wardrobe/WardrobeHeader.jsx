import { Filter, MoveUp, MoveDown } from "lucide-react";
import styles from "./Wardrobe.module.css";

export default function WardrobeHeader({totalClothes, filteredClothesCount, activeFiltersCount, sortBy, setSortBy, sortOrder, setSortOrder, onOpenFilters }) {
    return (
        <div className={styles.header}>
            <h2>
                Мой гардероб ({filteredClothesCount}
                {totalClothes !== filteredClothesCount && ` из ${totalClothes}`})
            </h2>

            <div className={styles.topControls}>
                <button className={styles.filterBtn} onClick={onOpenFilters}>
                    <Filter className={styles.svg} />
                    {activeFiltersCount > 0 && (
                        <span className={styles.filterBadge}>{activeFiltersCount}</span>
                    )}
                </button>

                <div className={styles.sortPanel}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={styles.sortSelect}
                    >
                        <option value="created_at">По дате</option>
                        <option value="name">По названию</option>
                    </select>

                    <button
                        className={styles.sortOrderBtn}
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    >
                        {sortOrder === 'asc' ? <MoveUp className={styles.svg} /> : <MoveDown className={styles.svg} />}
                    </button>
                </div>
            </div>
        </div>
    );
}