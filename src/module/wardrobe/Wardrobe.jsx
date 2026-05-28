"use client"

import styles from "./Wardrobe.module.css";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Plus } from "lucide-react";
import Link from "next/link";
import Loader from "@/module/loader/Loader";
import { toast } from "sonner";
import ImageLightbox from "@/module/imageLightbox/ImageLightbox";

import WardrobeHeader from "./WardrobeHeader";
import ClothingCard from "./ClothingCard";
import FilterModal from "./FilterModal";
import DeleteReplaceModal from "./DeleteReplaceModal";

export default function Wardrobe() {
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const [clothes, setClothes] = useState([]);
    const [filteredClothes, setFilteredClothes] = useState([]);
    const [allTags, setAllTags] = useState({});
    const [loading, setLoading] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [usedInOutfits, setUsedInOutfits] = useState([]);

    const [replacements, setReplacements] = useState({});
    const [activeReplaceOutfitId, setActiveReplaceOutfitId] = useState(null);

    const [filters, setFilters] = useState({ main: [], color: [], season: [], style: [], occasion: [] });
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const token = Cookies.get("token");
    const headers = { Authorization: `Bearer ${token}` };
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            setLoading(false);
            router.push("/login");
        } else {
            fetchData();
        }
    }, [token, router]);

    const fetchData = async () => {
        try {
            const [tagsResponse, clothesResponse] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/clothes`, { headers })
            ]);

            const groupedTags = tagsResponse.data.reduce((acc, tag) => {
                if (!acc[tag.group]) acc[tag.group] = [];
                acc[tag.group].push(tag);
                return acc;
            }, {});

            setAllTags(groupedTags);
            const clothesData = clothesResponse.data.data || clothesResponse.data;
            setClothes(clothesData);
            setFilteredClothes(clothesData);
        } catch (error) {
            console.error("Ошибка загрузки:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = [...clothes];

        if (filters.main.length > 0) result = result.filter(item => filters.main.includes(item.main_tag_id));

        ['color', 'season', 'style', 'occasion'].forEach(group => {
            if (filters[group].length > 0) {
                result = result.filter(item => item.tags?.some(tag => tag.group === group && filters[group].includes(tag.id)));
            }
        });

        result.sort((a, b) => {
            let comparison = sortBy === 'created_at'
                ? new Date(a.created_at) - new Date(b.created_at)
                : a.name.localeCompare(b.name, 'ru');
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredClothes(result);
    }, [clothes, filters, sortBy, sortOrder]);

    const checkClothingUsage = async (clothingId) => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/clothes/${clothingId}/outfits`, { headers });
            return data;
        } catch (error) {
            return [];
        }
    };

    const handleDeleteClick = async (item) => {
        setItemToDelete(item);
        const outfits = await checkClothingUsage(item.id);
        setUsedInOutfits(outfits);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setTimeout(() => {
            setActiveReplaceOutfitId(null);
            setReplacements({});
            setItemToDelete(null);
            setUsedInOutfits([]);
        }, 300);
    };

    const handleSelectReplacement = (item) => {
        setReplacements(prev => ({ ...prev, [activeReplaceOutfitId]: item }));
        setActiveReplaceOutfitId(null);
    };

    const hasReplacements = Object.keys(replacements).length > 0;

    const handleSaveOrDelete = async () => {
        if (!itemToDelete) return;
        setDeleteLoading(true);
        try {
            if (hasReplacements) {
                const updatePromises = usedInOutfits.map(outfit => {
                    const replacement = replacements[outfit.id];
                    if (replacement) {
                        const newClothingIds = outfit.clothing.map(c => c.id === itemToDelete.id ? replacement.id : c.id);
                        return axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/outfits/${outfit.id}`, {
                            name: outfit.name, deg: outfit.deg, clothing_ids: newClothingIds
                        }, { headers });
                    }
                    return Promise.resolve();
                });
                await Promise.all(updatePromises);
                toast.success('Изменения в образах сохранены');
            } else {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/clothes/${itemToDelete.id}`, { headers });
                toast.success('Одежда удалена');
            }
            fetchData();
            closeDeleteModal();
        } catch (error) {
            toast.error(hasReplacements ? 'Ошибка при сохранении' : 'Ошибка при удалении');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleFilterChange = (group, tagId) => {
        setFilters(prev => {
            const currentGroup = prev[group];
            const newGroup = currentGroup.includes(tagId) ? currentGroup.filter(id => id !== tagId) : [...currentGroup, tagId];
            return { ...prev, [group]: newGroup };
        });
    };

    const resetFilters = () => setFilters({ main: [], color: [], season: [], style: [], occasion: [] });
    const activeFiltersCount = Object.values(filters).flat().length;

    if (loading) return <Loader height={100} size={80} position="absolute" />;

    const availableForReplacement = clothes.filter(c => c.id !== itemToDelete?.id && c.main_tag_id === itemToDelete?.main_tag_id);

    return (
        <>
            <div className="flex-column-sm">
                <WardrobeHeader
                    totalClothes={clothes.length}
                    filteredClothesCount={filteredClothes.length}
                    activeFiltersCount={activeFiltersCount}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    onOpenFilters={() => setIsFilterModalOpen(true)}
                />

                <DeleteReplaceModal
                    isOpen={deleteModalOpen}
                    onClose={closeDeleteModal}
                    itemToDelete={itemToDelete}
                    deleteLoading={deleteLoading}
                    usedInOutfits={usedInOutfits}
                    replacements={replacements}
                    activeReplaceOutfitId={activeReplaceOutfitId}
                    setActiveReplaceOutfitId={setActiveReplaceOutfitId}
                    handleSelectReplacement={handleSelectReplacement}
                    hasReplacements={hasReplacements}
                    handleSaveOrDelete={handleSaveOrDelete}
                    availableForReplacement={availableForReplacement}
                />

                <FilterModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    allTags={allTags}
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    resetFilters={resetFilters}
                    activeFiltersCount={activeFiltersCount}
                />

                {filteredClothes.length === 0 ? (
                    <p className={styles.emptyMessage}>
                        {clothes.length === 0 ? 'Гардероб пуст' : 'Ничего не найдено по выбранным фильтрам'}
                    </p>
                ) : (
                    <ul className={styles.wardrobeList}>
                        {filteredClothes.map((item) => (
                            <ClothingCard
                                key={item.id}
                                item={item}
                                onClickImage={setFullScreenImage}
                                onDeleteClick={handleDeleteClick}
                            />
                        ))}
                        <li className={styles.addCloth}>
                            <Link href="/add"><Plus /><p>Добавить одежду</p></Link>
                        </li>
                    </ul>
                )}
            </div>
            <ImageLightbox isOpen={!!fullScreenImage} src={fullScreenImage} onClose={() => setFullScreenImage(null)} />
        </>
    );
}