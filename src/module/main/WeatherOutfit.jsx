"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDebouncedCallback } from 'use-debounce';
import { ThermometerSun } from 'lucide-react';
import { toast } from 'sonner';
import styles from './Main.module.css';
import Loader from "@/module/loader/Loader";
import OutfitModal from "@/module/main/OutfitModal";

const ACCU_API_KEY = process.env.NEXT_PUBLIC_ACCU_API_KEY;
const ACCU_BASE_URL = process.env.NEXT_PUBLIC_ACCU_BASE_URL || 'https://dataservice.accuweather.com';

export function WeatherOutfit({ initialTemp = 15 }) {
    const [currentTemp, setCurrentTemp] = useState(initialTemp);
    const [suitableOutfits, setSuitableOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tempTolerance, setTempTolerance] = useState(5);
    const [sliderValue, setSliderValue] = useState(5);
    const [selectedOutfit, setSelectedOutfit] = useState(null);

    const [city, setCity] = useState('Казань');
    const [accuLoading, setAccuLoading] = useState(false);
    const [accuError, setAccuError] = useState(null);

    const token = Cookies.get('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchCityLocationKey = async (cityName) => {
        const { data } = await axios.get(
            `${ACCU_BASE_URL}/locations/v1/cities/search`,
            {
                params: {
                    apikey: ACCU_API_KEY,
                    q: cityName,
                    language: 'ru-ru'
                }
            }
        );
        if (!data || data.length === 0) {
            throw new Error('Город не найден');
        }
        return data[0].Key;
    };

    const fetchCurrentTempByCity = async (cityName) => {
        setAccuLoading(true);
        setAccuError(null);
        try {
            const locationKey = await fetchCityLocationKey(cityName);
            const { data } = await axios.get(
                `${ACCU_BASE_URL}/currentconditions/v1/${locationKey}`,
                {
                    params: {
                        apikey: ACCU_API_KEY,
                        details: true,
                        language: 'ru-ru'
                    }
                }
            );
            if (!data || data.length === 0) {
                throw new Error('Не удалось получить погоду');
            }

            const tempC = data[0]?.Temperature?.Metric?.Value;
            if (typeof tempC !== 'number') {
                throw new Error('Некорректные данные температуры');
            }

            const rounded = Math.round(tempC);
            setCurrentTemp(rounded);
            toast.success(`Погода в ${cityName}: ${rounded}°C`);
        } catch (e) {
            console.error(e);
            const msg = e?.message || 'Ошибка загрузки погоды';
            setAccuError(msg);
            toast.error(msg);
        } finally {
            setAccuLoading(false);
        }
    };

    // --- Первый рендер: читаем город из localStorage и сразу дергаем погоду ---
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedCity = window.localStorage.getItem('weather_city');
        if (savedCity) {
            setCity(savedCity);
            fetchCurrentTempByCity(savedCity);
        } else {
            setLoading(true);
            fetchSuitableOutfits();
        }
    }, []);

    const handleCitySubmit = async (e) => {
        e.preventDefault();
        const trimmed = city.trim();
        if (!trimmed) return;

        if (typeof window !== 'undefined') {
            window.localStorage.setItem('weather_city', trimmed);
        }

        await fetchCurrentTempByCity(trimmed);
    };

    const fetchSuitableOutfits = async (tolerance = tempTolerance) => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits/weather`,
                {
                    headers,
                    params: {
                        suitable_temp: currentTemp,
                        tolerance
                    }
                }
            );
            setSuitableOutfits(data);
        } catch (error) {
            console.error('Ошибка загрузки образов:', error);
            toast.error('Не удалось загрузить подходящие образы');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuitableOutfits();
    }, [currentTemp]);

    const debouncedFetch = useDebouncedCallback((tolerance) => {
        fetchSuitableOutfits(tolerance);
    }, 300);

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
                <div className={styles.filters}>
                    <form onSubmit={handleCitySubmit} className={styles.cityForm}>
                        <input
                            className={styles.input}
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Введите город"
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={accuLoading || !city.trim()}
                        >
                            {accuLoading ? 'Загрузка...' : 'Обновить'}
                        </button>
                        {accuError && <p className={styles.error}>{accuError}</p>}
                    </form>

                    <div className={styles.controls}>
                        <label>
                            Допуск температуры: <span>±{tempTolerance}°C</span>
                            <input
                                type="range"
                                min="3"
                                max="10"
                                step="1"
                                value={sliderValue}
                                onChange={handleSliderChange}
                            />
                        </label>
                    </div>
                </div>


                {suitableOutfits.length === 0 ? (
                    <p>У вас пока нет образов</p>
                ) : (
                    <>
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
                                        {outfit.clothes_count > 4 && (
                                            <span className={styles.moreItems}>
                                                +{outfit.clothes_count - 4}
                                            </span>
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
