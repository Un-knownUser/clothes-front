"use client";

import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ThermometerSun, MapPin, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import styles from './Main.module.css';
import Loader from "@/module/loader/Loader";
import OutfitModal from "@/module/main/OutfitModal";
import {useDebouncedCallback} from "use-debounce";

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const WEATHER_BASE_URL = process.env.NEXT_PUBLIC_WEATHER_API_URL || 'https://api.weatherapi.com/v1';

export function WeatherOutfit({ initialTemp = 15 }) {
    const [currentTemp, setCurrentTemp] = useState(initialTemp);
    const [suitableOutfits, setSuitableOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tempTolerance, setTempTolerance] = useState(5);
    const [sliderValue, setSliderValue] = useState(5);
    const [selectedOutfit, setSelectedOutfit] = useState(null);

    // Состояния для города
    const [city, setCity] = useState('Москва');
    const [showCitySelector, setShowCitySelector] = useState(false);
    const [isEditingCity, setIsEditingCity] = useState(false);
    const [weatherLoading, setWeatherLoading] = useState(false);

    const token = Cookies.get('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchCurrentTempByCity = async (cityName, silent = false) => {
        if (!silent) setWeatherLoading(true);
        try {
            const { data } = await axios.get(`${WEATHER_BASE_URL}/current.json`, {
                params: { key: WEATHER_API_KEY, q: cityName, lang: 'ru' }
            });

            const tempC = Math.round(data?.current?.temp_c);
            setCurrentTemp(tempC);
            setCity(data.location.name); // Обновляем на официальное название из API

            if (typeof window !== 'undefined') {
                window.localStorage.setItem('weather_city', data.location.name);
            }
            if (!silent) toast.success(`Погода обновлена: ${data.location.name}`);
            setShowCitySelector(false);
            setIsEditingCity(false);
        } catch (e) {
            toast.error('Город не найден');
        } finally {
            setWeatherLoading(false);
        }
    };

    useEffect(() => {
        const savedCity = window.localStorage.getItem('weather_city');
        if (savedCity) {
            setCity(savedCity);
            fetchCurrentTempByCity(savedCity, true);
        } else {
            // Если города нет, показываем плавающее окошко подтверждения
            setShowCitySelector(true);
            fetchCurrentTempByCity(city, true); // Загружаем дефолтную Москву
        }
    }, []);

    const fetchSuitableOutfits = async (tolerance = tempTolerance, isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/outfits/weather`, {
                headers,
                params: { suitable_temp: currentTemp, tolerance: tempTolerance }
            });
            setSuitableOutfits(data);
        } catch (error) {
            toast.error('Ошибка загрузки образов');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuitableOutfits();
    }, [currentTemp]);

    const handleConfirmCity = () => {
        window.localStorage.setItem('weather_city', city);
        setShowCitySelector(false);
        toast.success(`Ваш город — ${city}`);
    };

    const debouncedFetch = useDebouncedCallback((tolerance) => {
        fetchSuitableOutfits(tolerance, true);
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


    if (loading && !weatherLoading) return <div style={{ height: "100vh" }}><Loader height={20} size={80} position="relative" /></div>;

    return (
        <>
            <div className={styles.container}>
                {/* Виджет подтверждения города */}
                {showCitySelector && (
                    <div className={styles.cityPopover}>
                        {!isEditingCity ? (
                            <div className={styles.popoverContent}>
                                <p>Ваш город <strong>{city}</strong>?</p>
                                <div className={styles.popoverActions}>
                                    <button onClick={handleConfirmCity} className={styles.confirmBtn}>Да</button>
                                    <button onClick={() => setIsEditingCity(true)} className={styles.changeBtn}>Нет, изменить</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); fetchCurrentTempByCity(city); }} className={styles.popoverForm}>
                                <input
                                    autoFocus
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Введите город"
                                />
                                <div className={styles.popoverActions}>
                                    <button type="submit" className={styles.confirmBtn}>Готово</button>
                                    <button type="button" className={styles.changeBtn} onClick={() => setIsEditingCity(false)}>Отмена</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                <div className={styles.headerRow}>
                    <h3>Образы под температуру {currentTemp}°C</h3>
                    <button className={styles.locationBadge} onClick={() => setShowCitySelector(!showCitySelector)}>
                        <MapPin size={20} /> {city}
                    </button>
                </div>

                <div className={styles.controls}>
                    <label htmlFor="temp">Допуск: ±{tempTolerance}°C</label>
                    <input
                        type="range"
                        min="3"
                        max="10"
                        name="temp"
                        value={sliderValue}
                        onChange={handleSliderChange}
                    />
                </div>

                <div className={styles.outfitsGrid}>
                    {suitableOutfits.length ===0 && <p>Ничего не найдено</p>}
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
                                {outfit.clothes_count > 3 && (
                                    <span className={styles.moreItems}>
                                        +{outfit.clothes_count - 3}
                                    </span>
                                )}
                            </div>
                            <div className={styles.outfitInfo}>
                                <h3>{outfit.name}</h3>
                                <div className={styles.tempBadge}>
                                    <ThermometerSun size={16} />
                                    {outfit.deg || '0'}°C
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <OutfitModal outfit={selectedOutfit} isOpen={!!selectedOutfit} onClose={() => setSelectedOutfit(null)} />
        </>
    );
}