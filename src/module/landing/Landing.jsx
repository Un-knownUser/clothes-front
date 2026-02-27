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
            <header className={styles.header}>
                {token ?
                    <Link href="/main" className="btn btn-primary">Профиль</Link> :
                    <Link href="/login" className="btn btn-primary">Войти</Link>
                }
            </header>
            <section className={styles.banner}>
                <div className={styles.leftSide}>
                    <h1>Ваш гардероб - в одном месте</h1>
                    <p>Цифровой гардероб для удобного планирования образов</p>
                    <Link href="/login" className="btn btn-primary">Войти</Link>
                </div>
                <div>
                    <Image src={m} alt="M" width={1280} height={720} />
                </div>
            </section>
        </>
    )
}