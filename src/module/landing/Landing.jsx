import styles from "./Landing.module.css";
import m from "./img/m.png";
import tags from "./img/tags.png";
import Image from "next/image";
import Link from "next/link";

export default function Landing() {
    return (
        <>
            <header className={styles.header}>
                <Link href="/login" className="btn btn-primary">Войти</Link>
            </header>
            <section className={styles.banner}>
                <div className={styles.leftSide}>
                    <h1>Ваш гардероб - в одном месте</h1>
                    <p>Цифровой гардероб для удобного планирования образов</p>
                    <Link href="/login" className="btn btn-primary">Войти</Link>
                    <Image src={tags} alt="Tags" width={1280} height={720} />
                </div>
                <div>
                    <Image src={m} alt="M" width={1280} height={720} />
                </div>
            </section>
        </>
    )
}