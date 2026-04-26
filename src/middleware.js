import { NextResponse } from "next/server";

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Получаем токен из куки
    const token = request.cookies.get("token")?.value;

    // 1. Конфигурируем пути
    const isAuthPage = pathname.startsWith('/auth');
    const isRootPage = pathname === '/';
    const isPublicPage = isAuthPage || isRootPage;

    // 2. Если пользователь авторизован...
    if (token) {
        // ...и пытается зайти на логин или лендинг — отправляем в личный кабинет
        if (isPublicPage) {
            return NextResponse.redirect(new URL('/main', request.url));
        }
        // В остальных случаях (уже на защищенных страницах) — пропускаем
        return NextResponse.next();
    }

    // 3. Если пользователь НЕ авторизован...
    if (!token) {
        // ...и пытается зайти на защищенную страницу
        if (!isPublicPage) {
            const loginUrl = new URL("/auth", request.url);
            // Запоминаем, куда он хотел попасть
            loginUrl.searchParams.set("from", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Пропускаем неавторизованных на публичные страницы (auth, /)
    return NextResponse.next();
}

// Настройка фильтрации (Matcher)
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};