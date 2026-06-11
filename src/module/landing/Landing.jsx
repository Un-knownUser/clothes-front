"use client";

import styles from "./Landing.module.css";
import m1 from "./img/1.png";
import m2 from "./img/2.png";
import m3 from "./img/3.png";
import m4 from "./img/4.png";
import Logo from "./img/Logo.svg";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";

export default function Landing() {
    const token = Cookies.get("token");

    return (
        <>
            <header className={styles.header}>
                <Image src={Logo} alt="Landing logo" width={256} height={256} />
            </header>
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
                    <Image src={m1} alt="Главный экран приложения" width={1920} height={1920} />
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
                            <Image src={m3} alt="Конструктор образов" width={1920} height={1920} />
                        </div>
                        <h3>Конструктор образов</h3>
                        <p>Сочетайте одежду и создавайте готовые комплекты прямо на экране, не перерывая полки.</p>
                    </li>
                    <li>
                        <div className={styles.styleImage}>
                            <Image src={m2} alt="Подбор по погоде" width={1920} height={1920} />
                        </div>
                        <h3>Умная погода</h3>
                        <p>Дождь или +25°C? Выберите температуру за окном, и приложение само предложит подходящий наряд.</p>
                    </li>
                </ul>
            </section>

            <section className={styles.convenience}>
                <div>
                    <Image src={m4} alt="Удобство использования" width={1920} height={1920} />
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
            <footer className={styles.footer}>
                <Image src={Logo} alt="Landing logo" width={256} height={256} />
                <p>©2025-2026 Все права защищены</p>
            </footer>
        </>
    )
}