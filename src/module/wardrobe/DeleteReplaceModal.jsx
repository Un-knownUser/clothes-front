import { X } from "lucide-react";
import styles from "./Wardrobe.module.css";

export default function DeleteReplaceModal({isOpen, onClose, itemToDelete, deleteLoading, usedInOutfits, replacements, activeReplaceOutfitId, setActiveReplaceOutfitId, handleSelectReplacement, hasReplacements, handleSaveOrDelete, availableForReplacement }) {
    if (!isOpen) return null;

    return (
        <div className={`modal-overlay ${styles.wardrobeModal}`} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>
                        {activeReplaceOutfitId
                            ? "Выберите замену"
                            : hasReplacements
                                ? "Сохранить изменения?"
                                : "Удалить одежду?"}
                    </h3>
                    <button onClick={onClose} className="none-btn" disabled={deleteLoading}>
                        <X />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {activeReplaceOutfitId ? (
                        <div className={styles.replaceContainer}>
                            <p>Выберите вещь из той же категории на замену:</p>
                            <div className={styles.replaceGrid}>
                                {availableForReplacement.length > 0 ? (
                                    availableForReplacement.map(item => (
                                        <div
                                            key={item.id}
                                            className={styles.replaceItem}
                                            onClick={() => handleSelectReplacement(item)}
                                        >
                                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image_path}`} alt="Одежда" />
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.emptyMessage}>Нет других вещей в этой категории</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <img
                                className={styles.deleteImage}
                                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${itemToDelete?.image_path}`}
                                alt={itemToDelete?.name}
                            />

                            {usedInOutfits.length > 0 ? (
                                <>
                                    <div className={styles.warningText}>
                                        <p>Эта одежда используется в <strong>{usedInOutfits.length}</strong> образе(ах)</p>
                                    </div>
                                    <ul className={styles.outfitsList}>
                                        {usedInOutfits.map((outfit) => {
                                            const currentReplacement = replacements[outfit.id];

                                            return (
                                                <li key={outfit.id} className={styles.outfitItem}>
                                                    <p>{outfit.name}</p>
                                                    <div className={styles.outfitClothes}>
                                                        {outfit.clothing.map((clothingItem) => {
                                                            const isDeletingItem = clothingItem.id === itemToDelete?.id;
                                                            const displayItem = isDeletingItem && currentReplacement
                                                                ? currentReplacement
                                                                : clothingItem;

                                                            return (
                                                                <div key={clothingItem.id} className={styles.outfitClothesDiv}>
                                                                    <div className={`${styles.imageWrap} ${isDeletingItem ? styles.deletingCloth : ''}`}>
                                                                        <img
                                                                            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${displayItem.image_path}`}
                                                                            alt={displayItem?.name}
                                                                        />
                                                                    </div>
                                                                    {isDeletingItem && (
                                                                        <button
                                                                            className={styles.smallReplaceBtn}
                                                                            onClick={() => setActiveReplaceOutfitId(outfit.id)}
                                                                        >
                                                                            {currentReplacement ? "Изменить" : "Заменить"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </>
                            ) : (
                                <div className={styles.goodText}>
                                    <p>Эта одежда не используется в образах.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    {activeReplaceOutfitId ? (
                        <button className="btn btn-secondary" onClick={() => setActiveReplaceOutfitId(null)} disabled={deleteLoading}>
                            Назад
                        </button>
                    ) : (
                        <>
                            <button className="btn btn-secondary" onClick={onClose} disabled={deleteLoading}>
                                Отмена
                            </button>

                            {hasReplacements ? (
                                <button className="btn btn-primary" onClick={handleSaveOrDelete} disabled={deleteLoading}>
                                    {deleteLoading ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={handleSaveOrDelete} disabled={deleteLoading}>
                                    {deleteLoading ? 'Удаление...' : 'Удалить'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}