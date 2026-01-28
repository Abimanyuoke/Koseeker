import { NextResponse, NextRequest } from "next/server";

export const middleware = async (request: NextRequest) => {
    const token = request.cookies.get("token")?.value;
    const role = request.cookies.get("role")?.value;

    // Redirect jika mengakses root /
    if (request.nextUrl.pathname === "/") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/landing-page";
        return NextResponse.redirect(redirectUrl);
    }

    // Halaman yang boleh diakses tanpa login
    const publicPaths = [
        "/landing-page",
        "/auth/login",
        "/auth/signup",
        "/auth/callback"
    ];

    // Cek apakah path saat ini adalah public path
    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    // Jika bukan public path dan tidak ada token, redirect ke login
    if (!isPublicPath && !token) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/auth/login";
        return NextResponse.redirect(redirectUrl);
    }

    // Proteksi untuk halaman /manager (hanya untuk owner)
    if (request.nextUrl.pathname.startsWith("/manager")) {
        if (!token || role !== "owner") {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = "/auth/login";
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    // Proteksi untuk halaman /user (hanya untuk society)
    if (request.nextUrl.pathname.startsWith("/user")) {
        if (!token || role !== "society") {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = "/auth/login";
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    return NextResponse.next(); // default: izinkan akses jika sudah login
};

export const config = {
    matcher: [
        "/",
        "/manager/:path*",
        "/user/:path*",
        "/home/:path*",
        "/book/:path*",
        "/kos/:path*",
        "/area-kos/:path*",
        "/kampus/:path*",
        "/favorit/:path*",
        "/kos_home/:path*",
        "/kos_promo/:path*"
    ],
};


// if (token && role) {
//             if (role === "owner") {
//                 redirectUrl.pathname = "/manager";
//             } else if (role === "society") {
//                 redirectUrl.pathname = "/home";
//             } else {
//                 redirectUrl.pathname = "/landing-page";
//             }
//         } else {
//             // Jika belum login, redirect ke login
//             redirectUrl.pathname = "/landing-page";
//         }