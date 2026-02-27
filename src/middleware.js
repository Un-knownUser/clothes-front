import { NextResponse } from "next/server";

export function middleware(request) {
    const pathname = request.nextUrl.pathname;
    const publicPaths = ["/login", "/register", "/"];

    if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
        return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value;

    if (pathname === '/' && token) {
        return NextResponse.redirect(new URL('/main', request.url));
    }

    if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
