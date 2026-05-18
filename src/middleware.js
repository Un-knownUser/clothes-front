import { NextResponse } from "next/server";

// Страницы ТОЛЬКО для неавторизованных (гостей)
const guestOnlyRoutes = ['/'];
const guestOnlyPrefixes = ['/auth'];

// Страницы, доступные ВСЕМ (и гостям, и авторизованным)
const publicForAllRoutes = ['/public-outfits'];

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("token")?.value;

    // Проверяем тип страницы
    const isGuestOnly =
        guestOnlyRoutes.includes(pathname) ||
        guestOnlyPrefixes.some(prefix => pathname.startsWith(prefix));

    const isPublicForAll = publicForAllRoutes.includes(pathname);

    // Пользователь АВТОРИЗОВАН
    if (token) {
        // Если лезет на страницу логина/регистрации или лендинг
        if (isGuestOnly) {
            return NextResponse.redirect(new URL('/main', request.url));
        }
        // На /public-outfits и защищенные маршруты — пропускаем
        return NextResponse.next();
    }

    // Пользователь НЕ АВТОРИЗОВАН
    if (!isGuestOnly && !isPublicForAll) {
        // Запоминаем, куда он хотел попасть, и отправляем на логин
        const loginUrl = new URL("/auth", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Неавторизованный идет на доступную ему страницу — пропускаем
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};