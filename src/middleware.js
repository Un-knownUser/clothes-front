import { NextResponse } from "next/server";

// Список точных публичных путей
const publicRoutes = ['/', '/public-outfits'];
// Префиксы для публичных путей (например, /auth/login, /auth/register)
const publicPrefixes = ['/auth'];

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("token")?.value;

    // Проверяем, является ли текущий путь публичным
    const isPublicPage =
        publicRoutes.includes(pathname) ||
        publicPrefixes.some(prefix => pathname.startsWith(prefix));

    // Пользователь АВТОРИЗОВАН
    if (token) {
        if (isPublicPage) {
            // Не пускаем авторизованных на лендинг и страницы логина
            return NextResponse.redirect(new URL('/main', request.url));
        }
        return NextResponse.next();
    }

    // Пользователь НЕ АВТОРИЗОВАН
    if (!isPublicPage) {
        // Запоминаем, куда он хотел попасть, и отправляем на логин
        const loginUrl = new URL("/auth", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Неавторизованный идет на публичную страницу — пропускаем
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};