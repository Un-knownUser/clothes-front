"use client";

import styles from "./Landing.module.css";
import m from "./img/m.png";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";

export default function Landing() {
    const token = Cookies.get("token");

    return (
        <>
            <section className={styles.banner}>
                <div className={styles.leftSide}>
                    <h1>Что надеть? <br />Больше не вопрос</h1>
                    <p>Оцифруйте свой гардероб: собирайте стильные капсулы, забывайте о долгих утренних сборах и получайте идеальные образы под любую погоду за пару кликов.</p>
                    {token ? (
                        <Link href="/main" className="btn btn-primary">Мой гардероб</Link>
                    ) : (
                        <Link href="/auth" className="btn btn-primary">Создать стиль</Link>
                    )}
                </div>
                <div>
                    {/* Сюда отлично впишется мокап телефона с главным экраном вашего приложения */}
                    <Image src={m} alt="Главный экран приложения" width={1280} height={720} />
                </div>
            </section>

            <section className={styles.ourStyle}>
                <h2>Ваш персональный стилист в кармане</h2>
                <ul className={styles.ourStyleGrid}>
                    <li>
                        <div className={`${styles.styleImage} ${styles.styleBlock}`}>
                            <Link href="/auth" className="btn">Начать</Link>
                        </div>
                        <h3>Виртуальный гардероб</h3>
                        <p>Сфотографируйте свои вещи, добавьте теги и сезоны. Ваш гардероб теперь как на ладони, а не в дальнем углу.</p>
                    </li>
                    <li>
                        <div className={styles.styleImage}>
                            {/* Мокап экрана создания образа */}
                            <Image src={m} alt="Конструктор образов" width={1280} height={720} />
                        </div>
                        <h3>Конструктор луков</h3>
                        <p>Сочетайте одежду и создавайте готовые комплекты прямо на экране, не перерывая полки.</p>
                    </li>
                    <li>
                        <div className={styles.styleImage}>
                            {/* Мокап экрана с погодой и рекомендацией */}
                            <Image src={m} alt="Подбор по погоде" width={1280} height={720} />
                        </div>
                        <h3>Умная погода</h3>
                        <p>Дождь или +25°C? Выберите температуру за окном, и приложение само предложит подходящий наряд.</p>
                    </li>
                </ul>
            </section>

            <section className={styles.convenience}>
                <div>
                    {/* Красивый изометрический мокап или коллаж из нескольких экранов */}
                    <Image src={m} alt="Удобство использования" width={1280} height={720} />
                </div>
                <div className={styles.rightSide}>
                    <h2>Стиль, который работает на вас</h2>
                    <p>Оцифровка гардероба — это не просто порядок в вещах, это новый уровень заботы о себе и своем времени.</p>
                    <ul>
                        <li><span>Экономия по утрам:</span> забудьте о хаотичных примерках перед зеркалом. Готовые образы всегда под рукой.</li>
                        <li><span>Осознанный шоппинг:</span> вы точно знаете, что у вас есть, избегаете дубликатов и покупаете только то, что подходит к вашей базе.</li>
                        <li><span>Вторая жизнь вещам:</span> находите новые сочетания для той самой одежды, которая годами висела без дела на вешалке.</li>
                    </ul>
                </div>
            </section>
        </>
    )
}