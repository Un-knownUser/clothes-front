"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Search, Loader2, ChevronDown } from 'lucide-react';
import styles from './Add.module.css';
import axios from 'axios';

export default function TagModal({ isOpen, onClose, imageIndex, imageName, onSave, images }) {
    const [groups, setGroups] = useState({});
    const [selectedTags, setSelectedTags] = useState({
        main: null, color: [], season: [], style: [], occasion: []
    });
    const [expandedGroups, setExpandedGroups] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const mountedRef = useRef(false);

    const groupConfig = [
        { key: 'main', label: 'Тип одежды', required: true },
        { key: 'color', label: 'Цвет' },
        { key: 'season', label: 'Сезон' },
        { key: 'style', label: 'Стиль' },
        { key: 'occasion', label: 'Повод' },
    ];

    const fetchGroupTags = useCallback(async (groupKey) => {
        if (groups[groupKey]) return;
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`, {
                params: { group: groupKey }
            });
            setGroups(prev => ({ ...prev, [groupKey]: data }));
        } catch (error) {
            console.error(`Группа ${groupKey}:`, error);
        }
    }, [groups]);

    const fetchSearchTags = useCallback(async (term) => {
        if (!term?.trim()) {
            setGroups(prev => ({ ...prev, all: [] }));
            return;
        }
        try {
            setSearchLoading(true);
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`, {
                params: { search: term.trim() }
            });
            setGroups(prev => ({ ...prev, all: data }));
        } catch (error) {
            console.error('Поиск:', error);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && !mountedRef.current) {
            mountedRef.current = true;
            fetchGroupTags('main');
        }
        return () => { mountedRef.current = false; };
    }, [isOpen, fetchGroupTags]);

    useEffect(() => {
        const timeout = setTimeout(() => fetchSearchTags(searchTerm), 300);
        return () => clearTimeout(timeout);
    }, [searchTerm, fetchSearchTags]);

    useEffect(() => {
        if (!isOpen) return;

        if (imageIndex >= 0 && images[imageIndex]?.tags) {
            const existingTags = images[imageIndex].tags;

            const allGroupsLoaded = groupConfig.every(g => groups[g.key]);
            if (!allGroupsLoaded) return;

            setSelectedTags({
                main: groups.main?.find(t => t.id === existingTags.mainTagId) || null,
                color: (groups.color || []).filter(t => existingTags.tagIds?.includes(t.id)),
                season: (groups.season || []).filter(t => existingTags.tagIds?.includes(t.id)),
                style: (groups.style || []).filter(t => existingTags.tagIds?.includes(t.id)),
                occasion: (groups.occasion || []).filter(t => existingTags.tagIds?.includes(t.id))
            });
        } else {
            setSelectedTags({ main: null, color: [], season: [], style: [], occasion: [] });
        }
    }, [isOpen, imageIndex, images]);

    const toggleGroup = (groupKey) => {
        if (groupKey === 'main') return;
        setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
        if (!groups[groupKey]) fetchGroupTags(groupKey);
    };

    const toggleTag = (groupKey, tag) => {
        setSelectedTags(prev => {
            if (groupKey === 'main') {
                return { ...prev, main: prev.main?.id === tag.id ? null : tag };
            }
            const current = prev[groupKey] || [];
            const isSelected = current.some(t => t.id === tag.id);
            return {
                ...prev,
                [groupKey]: isSelected
                    ? current.filter(t => t.id !== tag.id)
                    : [...current, tag]
            };
        });
    };

    const handleSave = () => {
        if (!selectedTags.main) {
            alert('Выберите тип одежды');
            return;
        }

        const allTags = [
            ...selectedTags.color,
            ...selectedTags.season,
            ...selectedTags.style,
            ...selectedTags.occasion
        ];

        const normalized = {
            mainTagId: selectedTags.main.id,
            mainTagLabel: selectedTags.main.label,
            tagIds: allTags.map(t => t.id),
            tagLabels: allTags.map(t => t.label)
        };

        onSave(imageIndex, normalized);
        onClose();
    };

    if (!isOpen) return null;

    return (
            <div className="modal-overlay" onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.header}>
                        <h2>Теги для <strong>{imageName}</strong></h2>
                        <button onClick={onClose} className="none-btn">
                            <X />
                        </button>
                    </div>

                    <div className={styles.searchField}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Поиск тегов..."
                            className={styles.searchInput}
                        />
                        {searchLoading && <Loader2 size={18} className={`${styles.searchIcon} ${styles.searchSpinner}`} />}
                    </div>

                    <div className={styles.groupsContainer}>
                        {groupConfig.map(group => (
                            <GroupAccordion
                                key={group.key}
                                group={group}
                                tags={groups[group.key] || []}
                                searchTags={groups.all || []}
                                selectedTags={selectedTags}
                                expanded={expandedGroups[group.key] || false}
                                onToggleGroup={() => toggleGroup(group.key)}
                                onToggleTag={toggleTag}
                                searchTerm={searchTerm}
                            />
                        ))}
                    </div>

                    <div className={styles.footer}>
                        <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
                        <button className="btn btn-primary" disabled={!selectedTags.main} onClick={handleSave}>
                            Сохранить
                        </button>
                    </div>
                </div>
            </div>
    );
}

function GroupAccordion({ group, tags, searchTags, selectedTags, expanded, onToggleGroup, onToggleTag, searchTerm }) {
    const safeTags = Array.isArray(tags) ? tags : [];
    const safeSearchTags = Array.isArray(searchTags) ? searchTags : [];

    const visibleTags = searchTerm.trim()
        ? safeSearchTags.filter(t => t.group === group.key)
        : safeTags;

    const isMain = group.key === 'main';
    const currentSelected = selectedTags[group.key];
    const safeSelected = Array.isArray(currentSelected) ? currentSelected : [];

    return (
        <section className={styles.group}>
            <button className={styles.groupHeader} onClick={onToggleGroup} disabled={isMain}>
                <h3>{group.label} {group.required && <span className={styles.required}>*</span>}</h3>
                {!isMain && <ChevronDown className={`${styles.chevron} ${expanded ? styles.rotated : ''}`} />}
            </button>

            {(isMain || expanded) && visibleTags.length > 0 && (
                <div className={styles.tagGrid}>
                    {visibleTags.slice(0, 24).map(tag => {
                        const isSelected = isMain
                            ? selectedTags.main?.id === tag.id
                            : safeSelected.some(t => t.id === tag.id);

                        return (
                            <button
                                key={tag.id}
                                className={`${styles.tagBtn} ${isSelected ? styles.selected : ''}`}
                                onClick={() => onToggleTag(group.key, tag)}
                            >
                                {tag.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {safeSelected.length > 0 && (
                <div className={styles.selected}>
                    {safeSelected.map(tag => (
                        <span key={tag.id} className={styles.chip}>
                            {tag.label}
                            <X size={12} onClick={() => onToggleTag(group.key, tag)} />
                        </span>
                    ))}
                </div>
            )}
        </section>
    );
}
