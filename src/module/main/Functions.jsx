"use client"

import styles from "./Main.module.css";
import Link from "next/link";
import {CirclePlus, Shirt, ExternalLink} from "lucide-react";

export default function Functions() {

    const functionsItems = [
        { name: "Добавить одежду", icon: <CirclePlus />, link: "/add" },
        { name: "Создать образ", icon: <Shirt />, link: "/outfits" },
        { name: "Публичные образы", icon: <ExternalLink />, link: "/public-outfits" },
    ]

    return (
        <div className={styles.container}>
            <h3>Функции</h3>
            <ul className={styles.functionsList}>
                {functionsItems.map((item, i) => (
                    <li key={i}>
                        <Link href={item.link}>
                            {item.icon}
                            <p>{item.name}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
