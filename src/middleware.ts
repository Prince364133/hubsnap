import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const { pathname } = request.nextUrl;

    // Handle Creator OS domain
    // Rewrite root to dashboard
    if (hostname.includes("creator-os.web.app")) {
        if (pathname === "/") {
            return NextResponse.rewrite(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (logo, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|logo.gif|logo.jpeg|sitemap.xml|robots.txt).*)',
    ],
};
