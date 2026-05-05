"use client";

import { useState, useCallback } from 'react';
import { CloudDownload, Trash2, Upload, Tag, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import styles from './Add.module.css';
import TagModal from "./TagModal";
import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function Add() {
    const [images, setImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(-1);

    const token = Cookies.get("token");
    const router = useRouter();

    const handleFiles = useCallback((newFiles) => {
        const uniqueFiles = Array.from(newFiles).filter(file =>
            !images.some(img => img.file.name === file.name && img.file.size === file.size)
        );

        if (images.length + uniqueFiles.length > 20) {
            toast.warning("Максимум 20 изображений!");
            return;
        }

        const newImages = uniqueFiles.map(file => ({
            file,
            previewURL: URL.createObjectURL(file),
            tags: null,
            name: file.name.replace(/\.[^/.]+$/, "")
        }));

        setImages(prev => [...prev, ...newImages]);
        toast.success(`Добавлено ${uniqueFiles.length} фото`);
    }, [images]);

    const removeImage = useCallback((index) => {
        URL.revokeObjectURL(images[index].previewURL);
        setImages(prev => prev.filter((_, i) => i !== index));
    }, [images]);

    const allTagged = images.every(img => img.tags?.mainTagId);

    const handleUpload = async () => {
        if (!allTagged) {
            toast.warning("Добавьте теги ко всем изображениям!");
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();

            images.forEach((img, index) => {
                formData.append('images[]', img.file);
                formData.append('names[]', img.name);
                formData.append('main_tag_ids[]', img.tags.mainTagId);

                if (img.tags.tagIds?.length > 0) {
                    img.tags.tagIds.forEach(tagId => {
                        formData.append(`tag_ids[${index}][]`, tagId);
                    });
                }
            });

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/clothes`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(`Загружено ${res.data.count} вещей!`);
            setImages([]);
            router.push('/my-wardrobe');

        } catch (error) {
            toast.error("Ошибка загрузки", {
                description: error.response?.data?.message || "Попробуйте снова"
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex-column-sm">
            <h2>Добавить в гардероб</h2>

            <label
                htmlFor="file"
                className={`${styles.uploadArea} ${isDragging ? styles.dragOver : ''}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                }}
            >
                <CloudDownload size={48} />
                <p>{isDragging ? 'Отпустите файлы' : `Загрузить (${images.length}/20)`}</p>
                <input
                    id="file"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => handleFiles(e.target.files)}
                    disabled={uploading}
                />
            </label>

            {images.length > 0 && (
                <div className="flex-column-sm">
                    <div>
                        <button
                            onClick={handleUpload}
                            className="btn btn-primary"
                            disabled={uploading || !allTagged}
                        >
                            {uploading ? <Loader2 className={`${styles.searchIcon} ${styles.searchSpinner}`} /> : <Upload className={styles.searchIcon} />}
                            {uploading ? 'Загрузка...' : `Загрузить ${images.length}шт.`}
                        </button>
                    </div>

                    <h3>Превью ({images.length})</h3>
                    <div className={styles.grid}>
                        {images.map((img, index) => (
                            <div key={`${img.file.name}-${index}`} className={styles.preview}>
                                <img src={img.previewURL} alt={img.file.name} />

                                {img.tags ? (
                                    <div className={styles.tagsOverlay}>
                                        <span className={styles.mainTag}>{img.tags.mainTagLabel}</span>
                                        {img.tags.tagLabels?.slice(0, 3).map((label, i) => (
                                            <span key={i} className={styles.tag}>{label}</span>
                                        ))}
                                        {img.tags.tagLabels?.length > 3 && (
                                            <span className={styles.more}>+{img.tags.tagLabels.length - 3}</span>
                                        )}
                                    </div>
                                ) : (
                                    <div className={styles.noTags}>Добавьте теги</div>
                                )}

                                <div className={styles.previewActions}>
                                    <button onClick={() => { setSelectedImageIndex(index); setTagModalOpen(true); }} disabled={uploading}>
                                        <Tag size={16} />
                                    </button>
                                    <button onClick={() => removeImage(index)} className={styles.delete} disabled={uploading}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <TagModal
                isOpen={tagModalOpen}
                onClose={() => setTagModalOpen(false)}
                imageIndex={selectedImageIndex}
                imageName={images[selectedImageIndex]?.file?.name || ''}
                onSave={(index, tags) => {
                    setImages(prev => prev.map((img, i) => i === index ? { ...img, tags } : img));
                    toast.success("Теги сохранены!");
                    setTagModalOpen(false);
                }}
                images={images}
            />
        </div>
    );
}
