import { Shirt } from "lucide-react";
import styles from "./Loader.module.css";

export default function Loader({ height, size, position }) {
    return (
        <div className="loading" style={{ height: `${height}vh`, position: position }}>
            <Shirt style={{ width: size }} className={styles.loader} />
        </div>
    );
}