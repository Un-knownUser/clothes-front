import Functions from "@/module/main/Functions";
import RecentlyClothesAdded from "@/module/main/RecentlyClothesAdded";
import {cookies} from "next/headers";
import {WeatherOutfit} from "@/module/main/WeatherOutfit";

export const metadata = {
    title: "Главная страница",
    description: "Главная страница",
};

export default async function Page() {
    const cookieStore = await cookies();
    const username = cookieStore.get("username")?.value || 'Гость';

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <h1>Привет, {username}</h1>
            <Functions />
            <RecentlyClothesAdded />
            <WeatherOutfit />
        </div>
    );
}
