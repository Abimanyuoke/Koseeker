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

    // Proteksi untuk /main (hanya boleh diakses jika sudah login)
    if (request.nextUrl.pathname.startsWith("/home")) {
        if (!token) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = "/auth/login";
            return NextResponse.redirect(redirectUrl);
        }

        return NextResponse.next(); // izinkan jika sudah login
    }

    // Proteksi untuk halaman /home (hanya boleh diakses jika sudah login)
    if (request.nextUrl.pathname.startsWith("/home")) {
        if (!token) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = "/auth/login";
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    // Proteksi untuk halaman /manager
    if (request.nextUrl.pathname.startsWith("/manager")) {
        if (!token || role !== "owner") {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = "/auth/login";
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    // Proteksi untuk halaman /user
    if (request.nextUrl.pathname.startsWith("/user")) {
        if (!token || role !== "society") {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = "/auth/login";
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    // Proteksi untuk halaman booking
    if (request.nextUrl.pathname.startsWith("/book")) {
        if (!token) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = "/auth/login";
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    return NextResponse.next(); // default: izinkan akses
};

export const config = {
    matcher: [
        "/manager/:path*",
        "/user/:path*",
        "/main/:path*", // Tambahkan ini agar /main diproteksi
        "/home/:path*", // Proteksi untuk halaman home
        "/book/:path*", // Proteksi untuk halaman booking
        "/" // root
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