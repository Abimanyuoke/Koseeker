import { getCookies } from "./client-cookies";

/**
 * Cek apakah user sudah login dengan memeriksa token dari cookies dan localStorage
 */
export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;

    const tokenFromCookies = getCookies('token');
    const tokenFromLocalStorage = localStorage.getItem('token');

    return !!(tokenFromCookies || tokenFromLocalStorage);
};

/**
 * Ambil token dari cookies atau localStorage
 */
export const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    const tokenFromCookies = getCookies('token');
    const tokenFromLocalStorage = localStorage.getItem('token');

    return tokenFromCookies || tokenFromLocalStorage;
};

/**
 * Ambil data user dari cookies atau localStorage
 */
export const getUserData = () => {
    if (typeof window === 'undefined') return null;

    const fromCookies = {
        id: getCookies('id'),
        name: getCookies('name'),
        email: getCookies('email'),
        role: getCookies('role'),
        phone: getCookies('phone'),
        profile_picture: getCookies('profile_picture')
    };

    const fromLocalStorage = {
        id: localStorage.getItem('id'),
        name: localStorage.getItem('name'),
        email: localStorage.getItem('email'),
        role: localStorage.getItem('role'),
        phone: localStorage.getItem('phone'),
        profile_picture: localStorage.getItem('profile_picture')
    };

    return {
        id: fromCookies.id || fromLocalStorage.id,
        name: fromCookies.name || fromLocalStorage.name,
        email: fromCookies.email || fromLocalStorage.email,
        role: fromCookies.role || fromLocalStorage.role,
        phone: fromCookies.phone || fromLocalStorage.phone,
        profile_picture: fromCookies.profile_picture || fromLocalStorage.profile_picture
    };
};

/**
 * Set/Update data autentikasi user
 */
export const setAuthData = (
    token: string,
    id: string | number,
    name: string,
    email: string,
    role: string,
    phone: string,
    profile_picture: string
) => {
    if (typeof window === 'undefined') return;

    // Set to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('id', id.toString());
    localStorage.setItem('name', name);
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
    localStorage.setItem('phone', phone);
    localStorage.setItem('profile_picture', profile_picture);
};

/**
 * Clear semua data autentikasi
 */
export const clearAuthData = () => {
    if (typeof window === 'undefined') return;

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('phone');
    localStorage.removeItem('profile_picture');

    // Note: Cookie akan dihapus oleh removeCookie function
};
