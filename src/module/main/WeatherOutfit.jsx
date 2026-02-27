"use client";

import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDebouncedCallback } from 'use-debounce';
import { ThermometerSun } from 'lucide-react';
import { toast } from 'sonner';
import styles from './Main.module.css';
import Loader from "@/module/loader/Loader";
import OutfitModal from "@/module/main/OutfitModal";

export function WeatherOutfit({currentTemp = 15}) {
    const [suitableOutfits, setSuitableOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tempTolerance, setTempTolerance] = useState(5);
    const [sliderValue, setSliderValue] = useState(5);
    const [selectedOutfit, setSelectedOutfit] = useState(null);

    const token = Cookies.get('token');
    const headers = {Authorization: `Bearer ${token}`};

    useEffect(() => {
        fetchSuitableOutfits();
    }, [currentTemp]);

    const debouncedFetch = useDebouncedCallback((tolerance) => {
        fetchSuitableOutfits(tolerance);
    }, 300);

    const fetchSuitableOutfits = async () => {
        setLoading(true);
        try {
            const {data} = await axios.get(
                `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits/weather?suitable_temp=${currentTemp}&tolerance=${tempTolerance}`,
                {headers}
            );
            setSuitableOutfits(data);
        } catch (error) {
            console.error('Ошибка загрузки образов:', error);
            toast.error('Не удалось загрузить подходящие образы');
        } finally {
            setLoading(false);
        }
    };

    const handleSliderChange = useCallback((e) => {
        const newValue = parseInt(e.target.value);
        setSliderValue(newValue);
        setTempTolerance(newValue);
        debouncedFetch(newValue);
    }, [debouncedFetch]);

    const getTempStatus = (outfitTemp) => {
        const diff = Math.abs(outfitTemp - currentTemp);
        if (diff <= 3) return 'perfect';
        if (diff <= tempTolerance) return 'good';
        return 'cold';
    };

    const handleOutfitClick = useCallback((outfit) => {
        setSelectedOutfit(outfit);
    }, []);

    const closeModal = useCallback(() => {
        setSelectedOutfit(null);
    }, []);

    if (loading) {
        return (
            <div style={{ height: "100vh" }}>
                <Loader height={20} size={80} position="relative" />
            </div>
        );
    }

    return (
        <>
            <div className={styles.container}>
                <h3>Образы по погоде ({currentTemp}°C)</h3>
                {suitableOutfits.length === 0 ? (
                    <p>У вас пока нет образов</p>
                ) : (
                    <>
                        <div className={styles.controls}>
                            <label>
                                Допуск температуры:
                                <input
                                    type="range"
                                    min="3"
                                    max="10"
                                    step="1"
                                    value={sliderValue}
                                    onChange={handleSliderChange}
                                />
                                <span>±{tempTolerance}°C</span>
                            </label>
                        </div>
                        {suitableOutfits.length > 0 && (
                            <div className={styles.outfitsGrid}>
                                {suitableOutfits.map((outfit) => (
                                    <div
                                        key={outfit.id}
                                        className={`${styles.outfitCard} ${styles[getTempStatus(outfit.deg || 0)]}`}
                                        onClick={() => handleOutfitClick(outfit)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={styles.outfitPreview}>
                                            {(outfit.clothing || []).slice(0, 3).map((item) => (
                                                <img
                                                    key={item.id}
                                                    src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image_path}`}
                                                    alt={item.name || 'Одежда'}
                                                    className={styles.clothingThumb}
                                                />
                                            ))}
                                            {(outfit.clothes_count) > 4 && (
                                                <span className={styles.moreItems}>+{outfit.clothes_count - 4}</span>
                                            )}
                                        </div>
                                        <div className={styles.outfitInfo}>
                                            <h3>{outfit.name}</h3>
                                            <div className={styles.tempBadge}>
                                                <ThermometerSun />
                                                {outfit.deg || 'N/A'}°C
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <OutfitModal
                outfit={selectedOutfit}
                isOpen={!!selectedOutfit}
                onClose={closeModal}
                status={getTempStatus(selectedOutfit?.deg || 0)}
            />
        </>
    );
}
